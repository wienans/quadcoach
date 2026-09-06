import mongoose from "mongoose";
import request from "supertest";

import Exercise from "../../models/exercise";
import TacticBoard from "../../models/tacticBoard";
import ExerciseAccess from "../../models/exerciseAccess";
import TacticBoardAccess from "../../models/tacticBoardAccess";
import User from "../../models/user";
import { app } from "../setup";
import { createVerifiedUser, getAccessToken } from "../utils/auth";

const authFor = async (user: { id: string }) =>
  `Bearer ${await getAccessToken(user)}`;

const leakingInfrastructureFailure = () =>
  new Error("mongodb://user:password@private-host");

const failingSummaryChain = () => {
  const chain: Record<string, unknown> = {};
  const rejected = Promise.reject(leakingInfrastructureFailure());
  chain.select = () => chain;
  chain.populate = () => chain;
  chain.lean = () => rejected;
  return chain;
};

const expectSanitizedFailure = (response: request.Response) => {
  expect(response.status).toBe(500);
  expect(response.body).toEqual({ message: "User summaries unavailable" });
  expect(JSON.stringify(response.body)).not.toContain("private-host");
};

describe("issue 149 purpose-specific User summaries", () => {
  it("groups owned and view/edit-granted Exercises as fixed card summaries in relationships", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "profile_exercise_owner@example.com",
    });
    const { user: collaborator } = await createVerifiedUser({
      email: "profile_exercise_collaborator@example.com",
    });

    const related = new mongoose.Types.ObjectId();
    const owned = await Exercise.create({
      name: "Owned drill",
      tags: ["Passing"],
      materials: ["Cone", "Ball"],
      time_min: 15,
      persons: 8,
      beaters: 2,
      chasers: 6,
      creator: "Coach",
      user: owner._id,
      related_to: [related],
      coaching_points: "must not leak",
      description_blocks: [{ description: "must not leak" }],
    });
    const editGranted = await Exercise.create({
      name: "Edit granted",
      tags: ["Defense"],
      user: collaborator._id,
      persons: 4,
    });
    const { insertedId: viewGrantedId } = await mongoose.connection
      .db!.collection("exercises")
      .insertOne({
        name: "View granted",
        user: collaborator._id,
        description_blocks: [{ description: "must not leak" }],
      });
    const unrelated = await Exercise.create({
      name: "Unrelated",
      persons: 2,
    });
    await ExerciseAccess.create([
      { user: owner._id, exercise: viewGrantedId, access: "view" },
      { user: owner._id, exercise: editGranted._id, access: "edit" },
      {
        user: owner._id,
        exercise: new mongoose.Types.ObjectId(),
        access: "view",
      },
    ]);

    const response = await request(app)
      .get(`/api/user/${owner.id}/exercises`)
      .set("Authorization", await authFor(owner))
      .expect(200);

    expect(response.body.owned).toEqual([
      {
        _id: owned.id,
        name: "Owned drill",
        tags: ["Passing"],
        creator: "Coach",
        user: owner.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        materials: ["Cone", "Ball"],
        durationMinutes: 15,
        persons: 8,
        beaters: 2,
        chasers: 6,
        relatedTo: [related.toString()],
      },
    ]);
    for (const field of [
      "description_blocks",
      "coaching_points",
      "time_min",
      "related_to",
      "__v",
      "accessLevel",
      "access",
    ]) {
      expect(response.body.owned[0]).not.toHaveProperty(field);
    }

    expect(response.body.accessible).toHaveLength(2);
    const byName = Object.fromEntries(
      response.body.accessible.map(
        (relationship: { item: { name: string } }) => [
          relationship.item.name,
          relationship,
        ],
      ),
    );
    expect(byName["View granted"]).toEqual({
      item: {
        _id: viewGrantedId.toString(),
        name: "View granted",
        tags: [],
        user: collaborator.id,
        createdAt: undefined,
        updatedAt: undefined,
        materials: [],
        durationMinutes: null,
        persons: null,
        beaters: null,
        chasers: null,
        relatedTo: [],
      },
      accessLevel: "view",
    });
    expect(byName["Edit granted"]).toEqual({
      item: {
        _id: editGranted.id,
        name: "Edit granted",
        tags: ["Defense"],
        user: collaborator.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        materials: [],
        durationMinutes: null,
        persons: 4,
        beaters: null,
        chasers: null,
        relatedTo: [],
      },
      accessLevel: "edit",
    });
    for (const relationship of response.body.accessible) {
      expect(relationship.item).not.toHaveProperty("accessLevel");
      expect(relationship.item).not.toHaveProperty("access");
      expect(relationship.item).not.toHaveProperty("description_blocks");
    }
    expect(JSON.stringify(response.body)).not.toContain(unrelated.id);
    expect(JSON.stringify(response.body)).not.toContain("must not leak");
  });

  it("groups owned and view/edit-granted TacticBoards without Pages or Share Link state", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "profile_board_owner@example.com",
    });
    const { user: collaborator } = await createVerifiedUser({
      email: "profile_board_collaborator@example.com",
    });

    const owned = await TacticBoard.create({
      name: "Owned board",
      tags: ["Zone"],
      isPrivate: true,
      creator: "Coach",
      user: owner._id,
      description: "must not leak",
      coaching_points: "must not leak",
      pages: [
        {
          objects: [
            { type: "circle", left: 10, top: 20, secret: "must not leak" },
          ],
        },
      ],
      shareToken: "must-not-leak",
    });
    const viewGranted = await TacticBoard.create({
      name: "View granted",
      isPrivate: true,
      user: collaborator._id,
      pages: [{ objects: [] }],
      shareToken: "view-granted-token",
    });
    const editGranted = await TacticBoard.create({
      name: "Edit granted",
      isPrivate: false,
      user: collaborator._id,
    });
    await TacticBoardAccess.create([
      { user: owner._id, tacticboard: viewGranted._id, access: "view" },
      { user: owner._id, tacticboard: editGranted._id, access: "edit" },
    ]);

    const response = await request(app)
      .get(`/api/user/${owner.id}/tacticboards`)
      .set("Authorization", await authFor(owner))
      .expect(200);

    expect(response.body.owned).toEqual([
      {
        _id: owned.id,
        name: "Owned board",
        tags: ["Zone"],
        isPrivate: true,
        creator: "Coach",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);
    for (const field of [
      "pages",
      "shareToken",
      "description",
      "coaching_points",
      "user",
      "__v",
      "accessLevel",
      "access",
    ]) {
      expect(response.body.owned[0]).not.toHaveProperty(field);
    }

    expect(response.body.accessible).toHaveLength(2);
    const byName = Object.fromEntries(
      response.body.accessible.map(
        (relationship: { item: { name: string } }) => [
          relationship.item.name,
          relationship,
        ],
      ),
    );
    expect(byName["View granted"]).toEqual({
      item: {
        _id: viewGranted.id,
        name: "View granted",
        tags: [],
        isPrivate: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      accessLevel: "view",
    });
    expect(byName["Edit granted"]).toEqual({
      item: {
        _id: editGranted.id,
        name: "Edit granted",
        tags: [],
        isPrivate: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      accessLevel: "edit",
    });
    expect(JSON.stringify(response.body)).not.toContain("must-not-leak");
    expect(JSON.stringify(response.body)).not.toContain("view-granted-token");
    expect(JSON.stringify(response.body)).not.toContain("must not leak");
  });

  it("keeps profile authorization and empty behavior", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "profile_empty_owner@example.com",
    });
    const { user: stranger } = await createVerifiedUser({
      email: "profile_empty_stranger@example.com",
    });
    const { user: admin } = await createVerifiedUser({
      email: "profile_empty_admin@example.com",
    });
    admin.roles = ["aDmIn"];
    await admin.save();

    await request(app)
      .get(`/api/user/${owner.id}/exercises`)
      .expect(401, { message: "Unauthorized" });
    await request(app)
      .get(`/api/user/${owner.id}/tacticboards`)
      .expect(401, { message: "Unauthorized" });

    await request(app)
      .get(`/api/user/${owner.id}/exercises`)
      .set("Authorization", await authFor(stranger))
      .expect(403, { message: "Forbidden" });
    await request(app)
      .get(`/api/user/${owner.id}/tacticboards`)
      .set("Authorization", await authFor(stranger))
      .expect(403, { message: "Forbidden" });

    await request(app)
      .get(`/api/user/not-an-object-id/exercises`)
      .set("Authorization", await authFor(owner))
      .expect(400, { message: "Invalid user ID" });
    await request(app)
      .get(`/api/user/not-an-object-id/tacticboards`)
      .set("Authorization", await authFor(owner))
      .expect(400, { message: "Invalid user ID" });

    const exercises = await request(app)
      .get(`/api/user/${owner.id}/exercises`)
      .set("Authorization", await authFor(admin))
      .expect(200);
    expect(exercises.body).toEqual({ owned: [], accessible: [] });

    const tacticBoards = await request(app)
      .get(`/api/user/${owner.id}/tacticboards`)
      .set("Authorization", await authFor(admin))
      .expect(200);
    expect(tacticBoards.body).toEqual({ owned: [], accessible: [] });
  });

  it("keeps the Admin listing authorized, allowlisted, and free of generic query behavior", async () => {
    const { user: admin } = await createVerifiedUser({
      email: "profile_listing_admin@example.com",
    });
    admin.roles = ["AdMiN"];
    await admin.save();
    const { user: plain } = await createVerifiedUser({
      email: "profile_listing_plain@example.com",
    });
    await mongoose.connection.db!.collection("users").insertOne({
      name: "Legacy",
      email: "profile_listing_legacy@example.com",
      password: "hashed-password-secret",
      roles: ["user"],
      active: false,
      isVerified: true,
      emailToken: "verification-secret",
      passwordResetToken: "reset-secret",
      lastActivity: new Date(),
    });

    await request(app)
      .get("/api/user")
      .expect(401, { message: "Unauthorized" });
    await request(app)
      .get("/api/user")
      .set("Authorization", await authFor(plain))
      .expect(403, { message: "Admin access required" });

    const legacyQuery = await request(app)
      .get("/api/user?email%5Bregex%5D=%5Enomatch&active=false")
      .set("Authorization", await authFor(admin))
      .expect(200);
    expect(legacyQuery.body).toHaveLength(3);
    for (const user of legacyQuery.body) {
      expect(Object.keys(user).sort()).toEqual([
        "_id",
        "active",
        "email",
        "name",
        "roles",
      ]);
    }
    const emails = legacyQuery.body.map(
      (user: { email: string }) => user.email,
    );
    expect(emails).toEqual(
      expect.arrayContaining([
        admin.email,
        plain.email,
        "profile_listing_legacy@example.com",
      ]),
    );
    const serialized = JSON.stringify(legacyQuery.body);
    expect(serialized).not.toContain("hashed-password-secret");
    expect(serialized).not.toContain("verification-secret");
    expect(serialized).not.toContain("reset-secret");
    expect(serialized).not.toContain("lastActivity");
    expect(serialized).not.toContain("isVerified");
    expect(serialized).not.toContain("password");
  });

  it("sanitizes profile and Admin listing infrastructure failures", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "profile_sanitized_owner@example.com",
    });
    const { user: admin } = await createVerifiedUser({
      email: "profile_sanitized_admin@example.com",
    });
    admin.roles = ["admin"];
    await admin.save();

    const adminListing = jest
      .spyOn(User, "find")
      .mockImplementationOnce(() => failingSummaryChain() as never);
    expectSanitizedFailure(
      await request(app)
        .get("/api/user")
        .set("Authorization", await authFor(admin)),
    );
    adminListing.mockRestore();

    const exerciseProfile = jest
      .spyOn(Exercise, "find")
      .mockImplementationOnce(() => failingSummaryChain() as never);
    expectSanitizedFailure(
      await request(app)
        .get(`/api/user/${owner.id}/exercises`)
        .set("Authorization", await authFor(owner)),
    );
    exerciseProfile.mockRestore();

    const tacticBoardProfile = jest
      .spyOn(TacticBoard, "find")
      .mockImplementationOnce(() => failingSummaryChain() as never);
    expectSanitizedFailure(
      await request(app)
        .get(`/api/user/${owner.id}/tacticboards`)
        .set("Authorization", await authFor(owner)),
    );
    tacticBoardProfile.mockRestore();
  });
});
