import mongoose from "mongoose";
import request from "supertest";
import Exercise from "../../models/exercise";
import TacticBoard from "../../models/tacticboard";
import { app } from "../setup";
import { authHeader, createVerifiedUser } from "../utils/auth";
import {
  expectExactFields,
  expectForbiddenFields,
} from "../utils/fieldAssertions";

describe("TacticBoard permanent legacy HTTP contracts", () => {
  it("does not accept canonical aliases for embedded Exercise TacticBoards", async () => {
    const { Authorization } = await authHeader();
    const tacticBoard = await TacticBoard.create({
      name: "Canonical Alias Board",
      isPrivate: false,
      pages: [],
    });

    const response = await request(app)
      .post("/api/exercises")
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.9")
      .send({
        name: "Canonical Alias Exercise",
        persons: 1,
        descriptionBlocks: [
          { tacticBoardId: tacticBoard.id, description: "Must be ignored" },
        ],
      });
    const persisted = await Exercise.findById(response.body._id).lean();

    expect(response.status).toBe(201);
    expect(persisted?.description_blocks).toEqual([]);
    expectForbiddenFields(response.body, [
      "descriptionBlocks",
      "description_blocks.tacticBoardId",
    ]);
  });

  it("preserves list and header envelopes without canonical key leakage", async () => {
    const ownerId = new mongoose.Types.ObjectId();
    await TacticBoard.create({
      name: "Envelope Board",
      isPrivate: false,
      tags: ["press"],
      pages: [],
      creator: "Contract Coach",
      user: ownerId,
    });

    const [listResponse, headerResponse] = await Promise.all([
      request(app)
        .get("/api/tacticboards?limit=5")
        .set("X-Forwarded-For", "192.0.2.10"),
      request(app)
        .get("/api/tacticboards/header?limit=5")
        .set("X-Forwarded-For", "192.0.2.11"),
    ]);

    expect(listResponse.status).toBe(200);
    expect(headerResponse.status).toBe(200);
    expectExactFields(listResponse.body, ["tacticboards", "pagination"]);
    expectExactFields(headerResponse.body, ["tacticboards", "pagination"]);
    expectExactFields(listResponse.body.pagination, ["total", "page", "pages"]);
    expectExactFields(headerResponse.body.pagination, [
      "total",
      "page",
      "pages",
    ]);
    expect(listResponse.body.tacticboards[0].name).toBe("Envelope Board");
    expectExactFields(headerResponse.body.tacticboards[0], [
      "_id",
      "name",
      "isPrivate",
      "tags",
      "creator",
      "user",
    ]);
    expectForbiddenFields(
      [listResponse.body, headerResponse.body],
      ["tacticBoards", "tacticBoard"],
    );
  });

  it("preserves Access and Favorite request, response, list, and header payloads", async () => {
    const { Authorization, user: owner } = await authHeader();
    const { user: viewer } = await createVerifiedUser({
      email: "legacy_payload_viewer@example.com",
    });
    const tacticBoard = await TacticBoard.create({
      name: "Payload Board",
      isPrivate: true,
      user: owner._id,
      pages: [],
    });

    const accessResponse = await request(app)
      .post(`/api/tacticboards/${tacticBoard.id}/access`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.20")
      .send({ userId: viewer.id, access: "view" });
    const accessListResponse = await request(app)
      .get(`/api/tacticboards/${tacticBoard.id}/access`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.21");
    const favoriteResponse = await request(app)
      .post("/api/favorites/tacticboards")
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.22")
      .send({ userId: owner.id, tacticboardId: tacticBoard.id });
    const favoriteListResponse = await request(app)
      .get("/api/favorites/tacticboards")
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.23");
    const favoriteHeaderResponse = await request(app)
      .get("/api/favorites/tacticboardsHeaders")
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.24");

    expect(accessResponse.status).toBe(201);
    expect(accessListResponse.status).toBe(200);
    expect(favoriteResponse.status).toBe(201);
    expect(favoriteListResponse.status).toBe(200);
    expect(favoriteHeaderResponse.status).toBe(200);
    expectExactFields(accessResponse.body, [
      "_id",
      "user",
      "tacticboard",
      "access",
      "createdAt",
      "__v",
    ]);
    expectExactFields(favoriteResponse.body, [
      "_id",
      "user",
      "tacticboard",
      "createdAt",
      "__v",
    ]);
    expectExactFields(accessListResponse.body[0], [
      "_id",
      "user",
      "tacticboard",
      "access",
      "createdAt",
      "__v",
    ]);
    expectExactFields(favoriteListResponse.body[0], [
      "_id",
      "user",
      "tacticboard",
      "createdAt",
      "__v",
    ]);
    expect(accessResponse.body).toMatchObject({
      user: viewer.id,
      tacticboard: tacticBoard.id,
      access: "view",
    });
    expect(favoriteResponse.body).toMatchObject({
      user: owner.id,
      tacticboard: tacticBoard.id,
    });
    expect(accessListResponse.body[0]).toMatchObject({
      tacticboard: tacticBoard.id,
      access: "view",
    });
    expect(favoriteListResponse.body[0]).toMatchObject({
      user: owner.id,
      tacticboard: tacticBoard.id,
    });
    expectExactFields(favoriteHeaderResponse.body[0], ["_id", "name"]);
    expectForbiddenFields(
      [
        accessResponse.body,
        accessListResponse.body,
        favoriteResponse.body,
        favoriteListResponse.body,
      ],
      ["tacticBoard", "tacticBoardId"],
    );

    const accessDeleteResponse = await request(app)
      .delete(`/api/tacticboards/${tacticBoard.id}/access`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.25")
      .send({ userId: viewer.id });
    const favoriteDeleteResponse = await request(app)
      .delete("/api/favorites/tacticboards")
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.26")
      .send({ userId: owner.id, tacticboardId: tacticBoard.id });

    expect(accessDeleteResponse.status).toBe(200);
    expect(favoriteDeleteResponse.status).toBe(200);
    expect(accessDeleteResponse.body).toEqual({
      message: "Access removed successfully",
    });
    expect(favoriteDeleteResponse.body).toEqual({
      message: "Favorite removed successfully",
    });
  });

  it("preserves the API share path and returned browser path", async () => {
    const { Authorization, user } = await authHeader();
    const tacticBoard = await TacticBoard.create({
      name: "Shared Board",
      isPrivate: true,
      user: user._id,
      pages: [],
    });

    const shareResponse = await request(app)
      .post(`/api/tacticboards/${tacticBoard.id}/share-link`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.30");
    const sharedReadResponse = await request(app)
      .get(`/api/tacticboards/share/${shareResponse.body.token}`)
      .set("X-Forwarded-For", "192.0.2.31");
    const deleteShareResponse = await request(app)
      .delete(`/api/tacticboards/${tacticBoard.id}/share-link`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.32");
    const deletedShareReadResponse = await request(app)
      .get(`/api/tacticboards/share/${shareResponse.body.token}`)
      .set("X-Forwarded-For", "192.0.2.33");

    expect(shareResponse.status).toBe(201);
    expectExactFields(shareResponse.body, ["message", "token", "shareLink"]);
    expect(shareResponse.body.shareLink).toBe(
      `https://quadcoach.app/tacticboards/share/${shareResponse.body.token}`,
    );
    expect(sharedReadResponse.status).toBe(200);
    expectExactFields(sharedReadResponse.body, [
      "_id",
      "name",
      "isPrivate",
      "tags",
      "pages",
      "user",
      "shareToken",
      "createdAt",
      "updatedAt",
      "__v",
    ]);
    expect(deleteShareResponse.status).toBe(200);
    expect(deleteShareResponse.body).toEqual({
      message: "Share link removed",
    });
    expect(deletedShareReadResponse.status).toBe(404);
    expectForbiddenFields(shareResponse.body, ["tacticBoard", "tacticBoardId"]);
  });

  it("preserves CRUD, page, metadata, authorization, sharing, and duplication response keys", async () => {
    const { Authorization, user: owner } = await authHeader();
    const { user: target } = await createVerifiedUser({
      email: "route_payload_target@example.com",
    });
    const createResponse = await request(app)
      .post("/api/tacticboards")
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.50")
      .send({
        name: "Created Board",
        isPrivate: false,
        tags: ["attack"],
        pages: [],
        creator: owner.name,
        user: owner.id,
        description: "Created description",
        coaching_points: "Created coaching points",
      });

    expect(createResponse.status).toBe(201);
    expectExactFields(createResponse.body, ["message", "_id"]);

    const tacticBoard = await TacticBoard.create({
      name: "Route Board",
      isPrivate: false,
      tags: ["attack"],
      pages: [{ version: "5.3.0", objects: [] }],
      creator: owner.name,
      user: owner._id,
      description: "Route description",
      coaching_points: "Route coaching points",
    });
    const pageId = (
      tacticBoard.pages?.[0] as unknown as { _id: mongoose.Types.ObjectId }
    )?._id.toString();
    expect(pageId).toBeDefined();

    const getResponse = await request(app)
      .get(`/api/tacticboards/${tacticBoard.id}`)
      .set("X-Forwarded-For", "192.0.2.51");
    expect(getResponse.status).toBe(200);
    expectExactFields(getResponse.body, [
      "_id",
      "name",
      "isPrivate",
      "tags",
      "pages",
      "creator",
      "user",
      "description",
      "coaching_points",
      "createdAt",
      "updatedAt",
      "__v",
    ]);

    const updateResponse = await request(app)
      .put(`/api/tacticboards/${tacticBoard.id}`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.52")
      .send({ name: "Updated Route Board" });
    expect(updateResponse.status).toBe(200);
    expectExactFields(updateResponse.body, ["message"]);

    const pageResponse = await request(app)
      .patch(`/api/tacticboards/${tacticBoard.id}/pages/${pageId}`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.53")
      .send({ _id: pageId, version: "5.4.0", objects: [] });
    expect(pageResponse.status).toBe(200);
    expectExactFields(pageResponse.body, ["message"]);

    const newPageResponse = await request(app)
      .post(`/api/tacticboards/${tacticBoard.id}/newPage`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.54")
      .send({ version: "5.4.0", objects: [] });
    expect(newPageResponse.status).toBe(200);
    expectExactFields(newPageResponse.body, ["message"]);

    const insertPageResponse = await request(app)
      .post(`/api/tacticboards/${tacticBoard.id}/insertPage/0`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.55")
      .send({ version: "5.4.0", objects: [] });
    expect(insertPageResponse.status).toBe(200);
    expectExactFields(insertPageResponse.body, ["message"]);

    const deletePageResponse = await request(app)
      .delete(`/api/tacticboards/${tacticBoard.id}/pages/${pageId}`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.56");
    expect(deletePageResponse.status).toBe(200);
    expectExactFields(deletePageResponse.body, ["message"]);

    const metaResponse = await request(app)
      .patch(`/api/tacticboards/${tacticBoard.id}/meta`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.57")
      .send({
        name: "Metadata Route Board",
        isPrivate: false,
        tags: ["defence"],
        description: "Metadata description",
        coaching_points: "Metadata coaching points",
      });
    expect(metaResponse.status).toBe(200);
    expectExactFields(metaResponse.body, ["message"]);

    const authorizationResponse = await request(app)
      .get(`/api/tacticboards/${tacticBoard.id}/checkAccess`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.58");
    expect(authorizationResponse.status).toBe(200);
    expectExactFields(authorizationResponse.body, [
      "hasAccess",
      "type",
      "level",
    ]);

    const namedShareResponse = await request(app)
      .post(`/api/tacticboards/${tacticBoard.id}/share`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.59")
      .send({ email: target.email, access: "view" });
    expect(namedShareResponse.status).toBe(201);
    expectExactFields(namedShareResponse.body, ["message"]);

    const duplicateResponse = await request(app)
      .post(`/api/tacticboards/${tacticBoard.id}/duplicate`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.60");
    expect(duplicateResponse.status).toBe(201);
    expectExactFields(duplicateResponse.body, ["message", "_id"]);

    const deleteResponse = await request(app)
      .delete(`/api/tacticboards/${tacticBoard.id}`)
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.61");
    expect(deleteResponse.status).toBe(200);
    expectExactFields(deleteResponse.body, ["message"]);

    expectForbiddenFields(
      [createResponse.body, getResponse.body, duplicateResponse.body],
      ["tacticBoard", "tacticBoardId"],
    );
  });

  it("round-trips description_blocks[].tactics_board over HTTP and storage", async () => {
    const { Authorization } = await authHeader();
    const tacticBoard = await TacticBoard.create({
      name: "Exercise Board",
      isPrivate: false,
      pages: [],
    });
    const exerciseRequest = {
      name: "Board Exercise",
      persons: 6,
      time_min: 5,
      description_blocks: [
        {
          description: "Use the board",
          tactics_board: tacticBoard.id,
          time_min: 5,
        },
      ],
    };

    const createResponse = await request(app)
      .post("/api/exercises")
      .set("Authorization", Authorization)
      .set("X-Forwarded-For", "192.0.2.40")
      .send(exerciseRequest);
    const storedExercise = await mongoose.connection
      .collection("exercises")
      .findOne({ _id: new mongoose.Types.ObjectId(createResponse.body._id) });
    const readResponse = await request(app)
      .get(`/api/exercises/${createResponse.body._id}`)
      .set("X-Forwarded-For", "192.0.2.41");

    expect(createResponse.status).toBe(201);
    expect(readResponse.status).toBe(200);
    expect(createResponse.body.description_blocks[0].tactics_board).toBe(
      tacticBoard.id,
    );
    expect(storedExercise?.description_blocks[0].tactics_board.toString()).toBe(
      tacticBoard.id,
    );
    expect(readResponse.body.description_blocks[0].tactics_board).toBe(
      tacticBoard.id,
    );
    expectForbiddenFields(
      [createResponse.body, storedExercise, readResponse.body],
      [
        "descriptionBlocks",
        "description_blocks.tacticBoard",
        "description_blocks.tacticBoardId",
      ],
    );
  });
});
