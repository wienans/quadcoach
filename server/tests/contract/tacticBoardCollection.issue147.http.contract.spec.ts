import mongoose, { mongo } from "mongoose";
import request from "supertest";

import TacticBoard from "../../models/tacticBoard";
import TacticBoardAccess from "../../models/tacticBoardAccess";
import { app } from "../setup";
import { createVerifiedUser, getAccessToken } from "../utils/auth";

const forwardedFor = (suffix: number) => `192.0.2.${suffix}`;

describe("issue 147 TacticBoard collection HTTP contract", () => {
  it("returns literal filtered summaries with exact pagination and no full-board fields", async () => {
    await mongoose.connection.db!.collection("tacticboards").insertMany([
      {
        name: "Literal [setup].* 10",
        tags: ["Attack", "Fast"],
        isPrivate: false,
        pages: [{ secret: true }],
        description: "must not leak",
        coaching_points: "must not leak",
        shareToken: "must-not-leak",
        __v: 7,
      },
      {
        name: "Literal setupxx 2",
        tags: ["Attack"],
        isPrivate: false,
      },
    ]);

    const response = await request(app)
      .get("/api/tacticboards")
      .set("X-Forwarded-For", forwardedFor(101))
      .query({
        search: "[setup].*",
        tags: ["attack", "FAST"],
        tagMode: "all",
        sort: "name",
        direction: "desc",
        page: "1",
        limit: "25",
      })
      .expect(200);

    expect(response.body).toEqual({
      items: [
        {
          _id: expect.any(String),
          name: "Literal [setup].* 10",
          tags: ["Attack", "Fast"],
          isPrivate: false,
        },
      ],
      pagination: { page: 1, limit: 25, total: 1, pages: 1 },
    });
    for (const field of [
      "pages",
      "description",
      "coaching_points",
      "shareToken",
      "__v",
    ]) {
      expect(response.body.items[0]).not.toHaveProperty(field);
    }
  });

  it("matches singular visibility for anonymous, Owner, both Access levels, and Admin", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "board_collection_owner@example.com",
    });
    const { user: viewer } = await createVerifiedUser({
      email: "board_collection_viewer@example.com",
    });
    const { user: editor } = await createVerifiedUser({
      email: "board_collection_editor@example.com",
    });
    const { user: admin } = await createVerifiedUser({
      email: "board_collection_admin@example.com",
    });
    admin.roles = ["aDmIn"];
    await admin.save();

    const publicBoard = await TacticBoard.create({
      name: "Public",
      isPrivate: false,
    });
    const legacyPublic = await mongoose.connection
      .db!.collection("tacticboards")
      .insertOne({ name: "Legacy public" });
    const owned = await TacticBoard.create({
      name: "Owned private",
      isPrivate: true,
      user: owner._id,
    });
    const viewGranted = await TacticBoard.create({
      name: "View granted",
      isPrivate: true,
    });
    const editGranted = await TacticBoard.create({
      name: "Edit granted",
      isPrivate: true,
    });
    const hidden = await TacticBoard.create({
      name: "Hidden private",
      isPrivate: true,
      shareToken: "share-link-is-not-discovery-authority",
    });
    await TacticBoardAccess.create([
      { user: viewer._id, tacticboard: viewGranted._id, access: "view" },
      { user: editor._id, tacticboard: editGranted._id, access: "edit" },
    ]);

    const browse = async (suffix: number, token?: string) => {
      const operation = request(app)
        .get("/api/tacticboards")
        .set("X-Forwarded-For", forwardedFor(suffix));
      if (token) operation.set("Authorization", `Bearer ${token}`);
      const response = await operation.expect(200);
      return response.body.items.map((item: { _id: string }) => item._id);
    };

    expect(await browse(102)).toEqual(
      expect.arrayContaining([
        publicBoard.id,
        legacyPublic.insertedId.toString(),
      ]),
    );
    expect(await browse(103)).toHaveLength(2);
    expect(await browse(104, await getAccessToken(owner))).toEqual(
      expect.arrayContaining([
        publicBoard.id,
        legacyPublic.insertedId.toString(),
        owned.id,
      ]),
    );
    expect(await browse(105, await getAccessToken(viewer))).toEqual(
      expect.arrayContaining([
        publicBoard.id,
        legacyPublic.insertedId.toString(),
        viewGranted.id,
      ]),
    );
    expect(await browse(106, await getAccessToken(editor))).toEqual(
      expect.arrayContaining([
        publicBoard.id,
        legacyPublic.insertedId.toString(),
        editGranted.id,
      ]),
    );
    expect(await browse(107, await getAccessToken(admin))).toEqual(
      expect.arrayContaining([
        publicBoard.id,
        legacyPublic.insertedId.toString(),
        owned.id,
        viewGranted.id,
        editGranted.id,
        hidden.id,
      ]),
    );
  });

  it("narrows the authorized set for private-only requests", async () => {
    const { user } = await createVerifiedUser({
      email: "board_private_filter@example.com",
    });
    await TacticBoard.create([
      { name: "Public", isPrivate: false },
      { name: "Owned", isPrivate: true, user: user._id },
      { name: "Hidden", isPrivate: true },
    ]);

    const anonymous = await request(app)
      .get("/api/tacticboards?privacy=private")
      .set("X-Forwarded-For", forwardedFor(108))
      .expect(200);
    expect(anonymous.body).toEqual({
      items: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    });

    const owner = await request(app)
      .get("/api/tacticboards?privacy=private")
      .set("Authorization", `Bearer ${await getAccessToken(user)}`)
      .set("X-Forwarded-For", forwardedFor(109))
      .expect(200);
    expect(owner.body.items.map((item: { name: string }) => item.name)).toEqual(
      ["Owned"],
    );
  });

  it("derives tag facets only from visible boards and rejects query modes", async () => {
    const { user } = await createVerifiedUser({
      email: "board_facet_owner@example.com",
    });
    await TacticBoard.create([
      { name: "A", isPrivate: false, tags: ["Attack", "Zone"] },
      { name: "B", isPrivate: false, tags: ["attack", "zone"] },
      { name: "C", isPrivate: false, tags: ["Attack"] },
      { name: "Owned", isPrivate: true, user: user._id, tags: ["Owned"] },
      { name: "Hidden", isPrivate: true, tags: ["Secret"] },
    ]);

    await request(app)
      .get("/api/tags/tacticboards")
      .set("X-Forwarded-For", forwardedFor(110))
      .expect(200, { items: ["Attack", "Zone"] });

    await request(app)
      .get("/api/tags/tacticboards")
      .set("Authorization", `Bearer ${await getAccessToken(user)}`)
      .set("X-Forwarded-For", forwardedFor(111))
      .expect(200, { items: ["Attack", "Owned", "Zone"] });

    await request(app)
      .get("/api/tags/tacticboards?tagName%5Bregex%5D=attack")
      .set("X-Forwarded-For", forwardedFor(112))
      .expect(400, {
        message: "Invalid collection query",
        errors: [{ field: "tagName", code: "unknown" }],
      });
  });

  it("rejects legacy and unsupported syntax with sanitized failures", async () => {
    await request(app)
      .get(
        "/api/tacticboards?name%5Bregex%5D=x&sortBy=created&privacy=secret&limit=101",
      )
      .set("X-Forwarded-For", forwardedFor(113))
      .expect(400, {
        message: "Invalid collection query",
        errors: [
          { field: "name", code: "unknown" },
          { field: "sortBy", code: "unknown" },
          { field: "limit", code: "outOfRange" },
          { field: "privacy", code: "unsupported" },
        ],
      });

    const countSpy = jest
      .spyOn(mongo.Collection.prototype, "countDocuments")
      .mockRejectedValueOnce(new Error("mongodb://user:password@private-host"));
    const response = await request(app)
      .get("/api/tacticboards")
      .set("X-Forwarded-For", forwardedFor(114))
      .expect(500);
    expect(response.body).toEqual({ message: "Collection query unavailable" });
    expect(JSON.stringify(response.body)).not.toContain("private-host");
    countSpy.mockRestore();
  });

  it("sanitizes authenticated Access lookup failures", async () => {
    const { user } = await createVerifiedUser({
      email: "board_grant_failure@example.com",
    });
    const grantSpy = jest
      .spyOn(mongo.FindCursor.prototype, "toArray")
      .mockRejectedValueOnce(new Error("mongodb://user:password@private-host"));

    const response = await request(app)
      .get("/api/tacticboards")
      .set("Authorization", `Bearer ${await getAccessToken(user)}`)
      .set("X-Forwarded-For", forwardedFor(115))
      .expect(500);

    expect(response.body).toEqual({ message: "Collection query unavailable" });
    expect(JSON.stringify(response.body)).not.toContain("private-host");
    grantSpy.mockRestore();
  });
});
