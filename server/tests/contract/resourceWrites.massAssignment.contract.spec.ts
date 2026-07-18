import mongoose from "mongoose";
import request from "supertest";
import { PracticePlan } from "../../models/practicePlan";
import TacticBoard from "../../models/tacticBoard";
import { app } from "../setup";
import { authHeader, createVerifiedUser } from "../utils/auth";

const forgedCreatedAt = "2000-01-01T00:00:00.000Z";
const forgedUpdatedAt = "2001-01-01T00:00:00.000Z";

describe("ordinary resource write allowlists", () => {
  it("allows TacticBoard create content while deriving ownership and rejecting forged fields", async () => {
    const { Authorization, user: owner } = await authHeader();
    const { user: forgedOwner } = await createVerifiedUser({
      email: "forged_tactic_board_owner@example.com",
    });
    const forgedId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .post("/api/tacticboards")
      .set("Authorization", Authorization)
      .send({
        _id: forgedId,
        name: "Allowlisted Board",
        isPrivate: true,
        tags: ["press"],
        pages: [{ version: "6.0.0", objects: [] }],
        creator: "Display Coach",
        description: "Legitimate description",
        coaching_points: "Legitimate coaching points",
        user: forgedOwner.id,
        owner: forgedOwner.id,
        shareToken: "forged-create-token",
        createdAt: forgedCreatedAt,
        updatedAt: forgedUpdatedAt,
        __v: 99,
        arbitrary: "must not persist",
      });

    expect(response.status).toBe(201);
    const persisted = await mongoose.connection
      .collection("tacticboards")
      .findOne({ _id: new mongoose.Types.ObjectId(response.body._id) });

    expect(persisted).toMatchObject({
      name: "Allowlisted Board",
      isPrivate: true,
      tags: ["press"],
      creator: "Display Coach",
      description: "Legitimate description",
      coaching_points: "Legitimate coaching points",
      user: owner._id,
      __v: 0,
    });
    expect(persisted?.pages).toHaveLength(1);
    expect(persisted?._id).not.toEqual(forgedId);
    expect(persisted?.shareToken).toBeUndefined();
    expect(persisted?.owner).toBeUndefined();
    expect(persisted?.arbitrary).toBeUndefined();
    expect(persisted?.createdAt.toISOString()).not.toBe(forgedCreatedAt);
    expect(persisted?.updatedAt.toISOString()).not.toBe(forgedUpdatedAt);
  });

  it("allows TacticBoard metadata, privacy, and content updates without restoring a token", async () => {
    const { Authorization, user: owner } = await authHeader();
    const { user: forgedOwner } = await createVerifiedUser({
      email: "forged_tactic_board_update_owner@example.com",
    });
    const tacticBoard = await TacticBoard.create({
      name: "Public Board",
      isPrivate: false,
      tags: [],
      pages: [],
      creator: "Original Coach",
      user: owner._id,
    });
    const originalCreatedAt = tacticBoard.get("createdAt") as Date;

    const response = await request(app)
      .put(`/api/tacticboards/${tacticBoard.id}`)
      .set("Authorization", Authorization)
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: "Private Updated Board",
        isPrivate: true,
        tags: ["zone"],
        pages: [{ version: "6.1.0", objects: [] }],
        creator: "Updated Display Coach",
        description: "Updated description",
        coaching_points: "Updated coaching points",
        user: forgedOwner.id,
        owner: forgedOwner.id,
        shareToken: "forged-restored-token",
        createdAt: forgedCreatedAt,
        updatedAt: forgedUpdatedAt,
        __v: 99,
        arbitrary: "must not persist",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Tactic Board updated successfully",
    });
    const persisted = await mongoose.connection
      .collection("tacticboards")
      .findOne({ _id: tacticBoard._id });

    expect(persisted).toMatchObject({
      _id: tacticBoard._id,
      name: "Private Updated Board",
      isPrivate: true,
      tags: ["zone"],
      creator: "Updated Display Coach",
      description: "Updated description",
      coaching_points: "Updated coaching points",
      user: owner._id,
      __v: 0,
    });
    expect(persisted?.pages).toHaveLength(1);
    expect(persisted?.shareToken).toBeUndefined();
    expect(persisted?.owner).toBeUndefined();
    expect(persisted?.arbitrary).toBeUndefined();
    expect(persisted?.createdAt).toEqual(originalCreatedAt);
    expect(persisted?.updatedAt.toISOString()).not.toBe(forgedUpdatedAt);
  });

  it("allows PracticePlan create content while enforcing server-owned lifecycle and ownership", async () => {
    const { Authorization, user: owner } = await authHeader();
    const { user: forgedOwner } = await createVerifiedUser({
      email: "forged_practice_plan_owner@example.com",
    });
    const forgedId = new mongoose.Types.ObjectId();
    const sections = [{ name: "Main", targetDuration: 60, groups: [] }];

    const response = await request(app)
      .post("/api/practice-plans")
      .set("Authorization", Authorization)
      .send({
        _id: forgedId,
        name: "  Allowlisted Practice  ",
        description: "Legitimate description",
        tags: ["conditioning"],
        sections,
        isPrivate: true,
        user: forgedOwner.id,
        owner: forgedOwner.id,
        shareToken: "forged-create-token",
        createdAt: forgedCreatedAt,
        updatedAt: forgedUpdatedAt,
        __v: 99,
        arbitrary: "must not persist",
      });

    expect(response.status).toBe(201);
    const persisted = await mongoose.connection
      .collection("practiceplans")
      .findOne({ _id: new mongoose.Types.ObjectId(response.body._id) });

    expect(persisted).toMatchObject({
      name: "Allowlisted Practice",
      description: "Legitimate description",
      tags: ["conditioning"],
      isPrivate: false,
      user: owner._id,
      __v: 0,
    });
    expect(persisted?.sections).toHaveLength(1);
    expect(persisted?._id).not.toEqual(forgedId);
    expect(persisted?.shareToken).toBeUndefined();
    expect(persisted?.owner).toBeUndefined();
    expect(persisted?.arbitrary).toBeUndefined();
    expect(persisted?.createdAt.toISOString()).not.toBe(forgedCreatedAt);
    expect(persisted?.updatedAt.toISOString()).not.toBe(forgedUpdatedAt);
  });

  it("allows PracticePlan metadata, privacy, and content updates without restoring a token", async () => {
    const { Authorization, user: owner } = await authHeader();
    const { user: forgedOwner } = await createVerifiedUser({
      email: "forged_practice_plan_update_owner@example.com",
    });
    const practicePlan = await PracticePlan.create({
      name: "Public Practice",
      description: "Original description",
      tags: [],
      sections: [],
      isPrivate: false,
      user: owner._id,
    });
    const originalCreatedAt = practicePlan.createdAt;
    const sections = [{ name: "Updated Main", targetDuration: 75, groups: [] }];

    const response = await request(app)
      .patch(`/api/practice-plans/${practicePlan.id}`)
      .set("Authorization", Authorization)
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: "  Private Updated Practice  ",
        description: "Updated description",
        tags: ["strategy"],
        sections,
        isPrivate: true,
        user: forgedOwner.id,
        owner: forgedOwner.id,
        shareToken: "forged-restored-token",
        createdAt: forgedCreatedAt,
        updatedAt: forgedUpdatedAt,
        __v: 99,
        arbitrary: "must not persist",
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      _id: practicePlan.id,
      name: "Private Updated Practice",
      description: "Updated description",
      tags: ["strategy"],
      isPrivate: true,
      user: owner.id,
    });
    expect(response.body.sections).toHaveLength(1);
    const persisted = await mongoose.connection
      .collection("practiceplans")
      .findOne({ _id: practicePlan._id });

    expect(persisted).toMatchObject({
      _id: practicePlan._id,
      name: "Private Updated Practice",
      description: "Updated description",
      tags: ["strategy"],
      isPrivate: true,
      user: owner._id,
      __v: 0,
    });
    expect(persisted?.sections).toHaveLength(1);
    expect(persisted?.shareToken).toBeUndefined();
    expect(persisted?.owner).toBeUndefined();
    expect(persisted?.arbitrary).toBeUndefined();
    expect(persisted?.createdAt).toEqual(originalCreatedAt);
    expect(persisted?.updatedAt.toISOString()).not.toBe(forgedUpdatedAt);
  });
});
