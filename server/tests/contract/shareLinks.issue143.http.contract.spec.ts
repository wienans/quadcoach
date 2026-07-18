import { Types } from "mongoose";
import request from "supertest";
import { PracticePlan } from "../../models/practicePlan";
import TacticBoard from "../../models/tacticBoard";
import { ddosLimiter } from "../../middleware/rateLimiter";
import {
  createPracticePlanShareLinkAdapter,
  createTacticBoardShareLinkAdapter,
} from "../../shareLinks/mongoShareLinkAdapters";
import { app } from "../setup";
import { createVerifiedUser, getAccessToken } from "../utils/auth";

jest.setTimeout(30_000);

beforeEach(() => {
  ddosLimiter.resetKey("::ffff:127.0.0.1");
  ddosLimiter.resetKey("127.0.0.1");
  ddosLimiter.resetKey("::/56");
});

interface ResourceCase {
  name: string;
  apiPath: string;
  sharePath: string;
  create(
    ownerId: Types.ObjectId,
    overrides?: Record<string, unknown>,
  ): Promise<{ id: string }>;
  publish(path: string, authorization: string): request.Test;
  reprivatize(path: string, authorization: string): request.Test;
  readPublishedContent(id: string): Promise<unknown>;
  expectedPublishedContent: unknown;
}

const cases: ResourceCase[] = [
  {
    name: "TacticBoard",
    apiPath: "/api/tacticboards",
    sharePath: "/api/tacticboards/share",
    create: async (ownerId, overrides = {}) => {
      const resource = await TacticBoard.create({
        name: "HTTP Share Board",
        user: ownerId,
        isPrivate: true,
        tags: ["share"],
        pages: [],
        ...overrides,
      });
      return { id: resource.id };
    },
    publish: (path, authorization) =>
      request(app)
        .put(path)
        .set("Authorization", authorization)
        .send({
          name: "Published Board",
          isPrivate: false,
          tags: ["published"],
          pages: [{ version: "published-board-content", objects: [] }],
        }),
    reprivatize: (path, authorization) =>
      request(app)
        .patch(`${path}/meta`)
        .set("Authorization", authorization)
        .send({ name: "Private Again", isPrivate: true, tags: [] }),
    readPublishedContent: async (id) =>
      (await TacticBoard.findById(id).lean())?.pages?.map(({ version }) => ({
        version,
      })),
    expectedPublishedContent: [{ version: "published-board-content" }],
  },
  {
    name: "PracticePlan",
    apiPath: "/api/practice-plans",
    sharePath: "/api/practice-plans/share",
    create: async (ownerId, overrides = {}) => {
      const resource = await PracticePlan.create({
        name: "HTTP Share Plan",
        user: ownerId,
        isPrivate: true,
        tags: ["share"],
        sections: [],
        ...overrides,
      });
      return { id: resource.id };
    },
    publish: (path, authorization) =>
      request(app)
        .patch(path)
        .set("Authorization", authorization)
        .send({
          name: "Published Plan",
          isPrivate: false,
          tags: ["published"],
          sections: [
            { name: "Published Section", targetDuration: 25, groups: [] },
          ],
        }),
    reprivatize: (path, authorization) =>
      request(app)
        .patch(path)
        .set("Authorization", authorization)
        .send({ name: "Private Again", isPrivate: true, tags: [] }),
    readPublishedContent: async (id) =>
      (await PracticePlan.findById(id).lean())?.sections.map(
        ({ name, targetDuration }) => ({ name, targetDuration }),
      ),
    expectedPublishedContent: [
      { name: "Published Section", targetDuration: 25 },
    ],
  },
];

const authFor = async (user: { id: string }) =>
  `Bearer ${await getAccessToken(user)}`;

const tokenFrom = (shareLink: string) =>
  decodeURIComponent(new URL(shareLink).pathname.split("/").at(-1) ?? "");

const trackPublishWrites = (resourceName: string) => {
  const updateOne =
    resourceName === "TacticBoard"
      ? jest.spyOn(TacticBoard, "updateOne")
      : jest.spyOn(PracticePlan, "updateOne");
  const practicePlanFollowUp =
    resourceName === "PracticePlan"
      ? jest.spyOn(PracticePlan, "findByIdAndUpdate")
      : undefined;
  return {
    expectSingleAtomicWrite: () => {
      expect(updateOne).toHaveBeenCalledTimes(1);
      if (practicePlanFollowUp) {
        expect(practicePlanFollowUp).not.toHaveBeenCalled();
      }
    },
    restore: () => {
      updateOne.mockRestore();
      practicePlanFollowUp?.mockRestore();
    },
  };
};

describe.each(cases)("$name Share Link HTTP activation", (testCase) => {
  it("supports status, legacy-token continuity, ensure, rotate, revoke, and uniform public resolution", async () => {
    const { user: owner } = await createVerifiedUser({
      email: `${testCase.name.toLowerCase()}_lifecycle@example.com`,
    });
    const authorization = await authFor(owner);
    const legacyToken = `legacy ${testCase.name} / + %`;
    const resource = await testCase.create(owner._id, {
      shareToken: legacyToken,
    });
    const managementPath = `${testCase.apiPath}/${resource.id}/share-link`;

    const status = await request(app)
      .get(managementPath)
      .set("Authorization", authorization);
    expect(status.status).toBe(200);
    expect(status.body).toEqual({
      status: "active",
      shareLink: `https://quadcoach.app${testCase.sharePath.replace(
        "/api",
        "",
      )}/${encodeURIComponent(legacyToken)}`,
    });
    expect(status.body).not.toHaveProperty("token");

    const legacyRead = await request(app).get(
      `${testCase.sharePath}/${encodeURIComponent(legacyToken)}`,
    );
    expect(legacyRead.status).toBe(200);
    expect(legacyRead.body).not.toHaveProperty("shareToken");
    expect(legacyRead.body).not.toHaveProperty("user");
    expect(legacyRead.body).not.toHaveProperty("isPrivate");

    const existing = await request(app)
      .post(managementPath)
      .set("Authorization", authorization);
    expect(existing.status).toBe(200);
    expect(existing.body).toEqual({
      status: "existing",
      shareLink: status.body.shareLink,
    });

    const rotated = await request(app)
      .put(managementPath)
      .set("Authorization", authorization);
    expect(rotated.status).toBe(200);
    expect(rotated.body.status).toBe("rotated");
    expect(rotated.body.shareLink).toMatch(/^https:\/\/quadcoach\.app\//);
    expect(rotated.body).not.toHaveProperty("token");
    expect(
      (
        await request(app).get(
          `${testCase.sharePath}/${encodeURIComponent(legacyToken)}`,
        )
      ).body,
    ).toEqual({ message: "Share link not found" });

    const rotatedToken = tokenFrom(rotated.body.shareLink);
    expect(
      (
        await request(app).get(
          `${testCase.sharePath}/${encodeURIComponent(rotatedToken)}`,
        )
      ).status,
    ).toBe(200);

    const revoked = await request(app)
      .delete(managementPath)
      .set("Authorization", authorization);
    const revokedAgain = await request(app)
      .delete(managementPath)
      .set("Authorization", authorization);
    expect(revoked.status).toBe(200);
    expect(revoked.body).toEqual({ status: "inactive" });
    expect(revokedAgain.body).toEqual({ status: "inactive" });
    expect(
      (
        await request(app).get(
          `${testCase.sharePath}/${encodeURIComponent(rotatedToken)}`,
        )
      ).body,
    ).toEqual({ message: "Share link not found" });

    const created = await request(app)
      .post(managementPath)
      .set("Authorization", authorization);
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("created");
    expect(created.body).not.toHaveProperty("token");
  });

  it("maps auth, identity, existence, and lifecycle conflicts exactly", async () => {
    const { user: owner } = await createVerifiedUser({
      email: `${testCase.name.toLowerCase()}_mapping_owner@example.com`,
    });
    const { user: unrelated } = await createVerifiedUser({
      email: `${testCase.name.toLowerCase()}_mapping_other@example.com`,
    });
    const authorization = await authFor(owner);
    const unrelatedAuthorization = await authFor(unrelated);
    const privateResource = await testCase.create(owner._id);
    const inactivePath = `${testCase.apiPath}/${privateResource.id}/share-link`;
    const publicResource = await testCase.create(owner._id, {
      isPrivate: false,
    });
    const publicPath = `${testCase.apiPath}/${publicResource.id}/share-link`;
    const missingPath = `${testCase.apiPath}/${new Types.ObjectId()}/share-link`;

    expect((await request(app).get(inactivePath)).status).toBe(401);
    expect(
      (
        await request(app)
          .get(inactivePath)
          .set("Authorization", unrelatedAuthorization)
      ).status,
    ).toBe(403);
    expect(
      (
        await request(app)
          .get(`${testCase.apiPath}/invalid/share-link`)
          .set("Authorization", authorization)
      ).status,
    ).toBe(400);
    expect(
      (await request(app).get(missingPath).set("Authorization", authorization))
        .status,
    ).toBe(404);
    expect(
      (await request(app).put(inactivePath).set("Authorization", authorization))
        .status,
    ).toBe(409);

    for (const method of ["get", "post", "put", "delete"] as const) {
      expect(
        (
          await request(app)
            [method](publicPath)
            .set("Authorization", authorization)
        ).status,
      ).toBe(409);
    }
    expect((await request(app).get(`${testCase.sharePath}/%20`)).body).toEqual({
      message: "Share link not found",
    });
    expect((await request(app).get(`${testCase.sharePath}/%`)).body).toEqual({
      message: "Share link not found",
    });
    const bareSharePath = await request(app).get(testCase.sharePath);
    expect(bareSharePath.status).toBe(400);
    expect(bareSharePath.body).not.toEqual({ message: "Share link not found" });

    const unrelatedMalformedPath = await request(app).get(
      `${testCase.apiPath}/%`,
    );
    expect(unrelatedMalformedPath.body).not.toEqual({
      message: "Share link not found",
    });
  });

  it("atomically invalidates on publish and deletion without restoring on reprivatization", async () => {
    const { user: owner } = await createVerifiedUser({
      email: `${testCase.name.toLowerCase()}_invalidation@example.com`,
    });
    const authorization = await authFor(owner);
    const resource = await testCase.create(owner._id);
    const resourcePath = `${testCase.apiPath}/${resource.id}`;
    const managementPath = `${resourcePath}/share-link`;
    const ensured = await request(app)
      .post(managementPath)
      .set("Authorization", authorization);
    const token = tokenFrom(ensured.body.shareLink);

    const publishWrites = trackPublishWrites(testCase.name);
    expect((await testCase.publish(resourcePath, authorization)).status).toBe(
      200,
    );
    publishWrites.expectSingleAtomicWrite();
    const model = testCase.name === "TacticBoard" ? TacticBoard : PracticePlan;
    expect(jest.mocked(model.updateOne).mock.calls[0]?.slice(0, 2)).toEqual([
      { _id: resource.id },
      expect.objectContaining({
        $set: expect.objectContaining({ isPrivate: false }),
        $unset: { shareToken: 1 },
      }),
    ]);
    publishWrites.restore();
    expect(await testCase.readPublishedContent(resource.id)).toEqual(
      testCase.expectedPublishedContent,
    );
    expect(
      (
        await request(app).get(
          `${testCase.sharePath}/${encodeURIComponent(token)}`,
        )
      ).body,
    ).toEqual({
      message: "Share link not found",
    });
    expect(
      (await testCase.reprivatize(resourcePath, authorization)).status,
    ).toBe(200);
    expect(
      (
        await request(app)
          .get(managementPath)
          .set("Authorization", authorization)
      ).body,
    ).toEqual({ status: "inactive" });

    const recreated = await request(app)
      .post(managementPath)
      .set("Authorization", authorization);
    const replacementToken = tokenFrom(recreated.body.shareLink);
    expect(
      (
        await request(app)
          .delete(resourcePath)
          .set("Authorization", authorization)
      ).status,
    ).toBe(200);
    expect(
      (
        await request(app).get(
          `${testCase.sharePath}/${encodeURIComponent(replacementToken)}`,
        )
      ).body,
    ).toEqual({ message: "Share link not found" });
  });

  it("omits persistence-only tokens from ordinary singular and collection responses", async () => {
    const { user: owner } = await createVerifiedUser({
      email: `${testCase.name.toLowerCase()}_projection@example.com`,
    });
    const authorization = await authFor(owner);
    const resource = await testCase.create(owner._id, {
      shareToken: "private-token",
    });

    const singular = await request(app)
      .get(`${testCase.apiPath}/${resource.id}`)
      .set("Authorization", authorization);
    const collection = await request(app)
      .get(testCase.apiPath)
      .set("Authorization", authorization);
    expect(JSON.stringify(singular.body)).not.toContain("shareToken");
    expect(JSON.stringify(collection.body)).not.toContain("shareToken");
  });

  it("sanitizes infrastructure failures", async () => {
    const { user: owner } = await createVerifiedUser({
      email: `${testCase.name.toLowerCase()}_infrastructure@example.com`,
    });
    const authorization = await authFor(owner);
    const resource = await testCase.create(owner._id);
    const failure = new Error("database credentials and host");
    const spy =
      testCase.name === "TacticBoard"
        ? jest.spyOn(TacticBoard, "findById").mockImplementationOnce(() => {
            throw failure;
          })
        : jest.spyOn(PracticePlan, "findById").mockImplementationOnce(() => {
            throw failure;
          });

    const response = await request(app)
      .get(`${testCase.apiPath}/${resource.id}/share-link`)
      .set("Authorization", authorization);
    spy.mockRestore();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Share Link operation failed" });
    expect(JSON.stringify(response.body)).not.toContain(failure.message);
  });

  it("atomically removes an interleaved token and orphan tokens on already-public updates", async () => {
    const { user: owner } = await createVerifiedUser({
      email: `${testCase.name.toLowerCase()}_publication_race@example.com`,
    });
    const authorization = await authFor(owner);
    const resource = await testCase.create(owner._id);
    const resourcePath = `${testCase.apiPath}/${resource.id}`;
    const adapter =
      testCase.name === "TacticBoard"
        ? createTacticBoardShareLinkAdapter()
        : createPracticePlanShareLinkAdapter();

    await expect(adapter.inspect(resource.id)).resolves.toMatchObject({
      isPrivate: true,
      activeToken: undefined,
    });
    await expect(
      adapter.ensure(resource.id, "interleaved-token"),
    ).resolves.toEqual({ outcome: "created", token: "interleaved-token" });

    expect((await testCase.publish(resourcePath, authorization)).status).toBe(
      200,
    );
    const collection =
      testCase.name === "TacticBoard"
        ? TacticBoard.collection
        : PracticePlan.collection;
    expect(
      await collection.findOne({ _id: new Types.ObjectId(resource.id) }),
    ).not.toHaveProperty("shareToken");

    await collection.updateOne(
      { _id: new Types.ObjectId(resource.id) },
      { $set: { shareToken: "orphan-token" } },
    );
    expect((await testCase.publish(resourcePath, authorization)).status).toBe(
      200,
    );
    expect(
      await collection.findOne({ _id: new Types.ObjectId(resource.id) }),
    ).not.toHaveProperty("shareToken");
  });
});

it("treats a valid token used against the wrong resource kind as not found", async () => {
  const ownerId = new Types.ObjectId();
  await TacticBoard.create({
    name: "Wrong-kind Board",
    user: ownerId,
    isPrivate: true,
    pages: [],
    shareToken: "wrong-kind-token",
  });

  const response = await request(app).get(
    "/api/practice-plans/share/wrong-kind-token",
  );
  expect(response.status).toBe(404);
  expect(response.body).toEqual({ message: "Share link not found" });
});

it("atomically publishes TacticBoard metadata and removes an ensured token", async () => {
  const { user: owner } = await createVerifiedUser({
    email: "tacticboard_metadata_publication@example.com",
  });
  const authorization = await authFor(owner);
  const board = await TacticBoard.create({
    name: "Private metadata board",
    user: owner._id,
    isPrivate: true,
    pages: [],
  });
  const managementPath = `/api/tacticboards/${board.id}/share-link`;
  expect(
    (
      await request(app)
        .post(managementPath)
        .set("Authorization", authorization)
    ).status,
  ).toBe(201);

  const updateOne = jest.spyOn(TacticBoard, "updateOne");
  const response = await request(app)
    .patch(`/api/tacticboards/${board.id}/meta`)
    .set("Authorization", authorization)
    .send({
      name: "Published metadata board",
      isPrivate: false,
      tags: ["metadata"],
      description: "Published atomically",
    });
  expect(response.status).toBe(200);
  expect(updateOne).toHaveBeenCalledTimes(1);
  expect(updateOne.mock.calls[0]?.slice(0, 2)).toEqual([
    { _id: board.id },
    expect.objectContaining({
      $set: expect.objectContaining({
        name: "Published metadata board",
        isPrivate: false,
      }),
      $unset: { shareToken: 1 },
    }),
  ]);
  updateOne.mockRestore();

  const published = await TacticBoard.collection.findOne({ _id: board._id });
  expect(published).toMatchObject({
    name: "Published metadata board",
    isPrivate: false,
  });
  expect(published).not.toHaveProperty("shareToken");
});

it("preserves both pre-existing capabilities when collections share a token", async () => {
  const ownerId = new Types.ObjectId();
  await Promise.all([
    TacticBoard.create({
      name: "Colliding Board",
      user: ownerId,
      isPrivate: true,
      pages: [],
      shareToken: "cross-kind-continuity-token",
    }),
    PracticePlan.create({
      name: "Colliding Plan",
      user: ownerId,
      isPrivate: true,
      sections: [],
      shareToken: "cross-kind-continuity-token",
    }),
  ]);

  const [board, plan] = await Promise.all([
    request(app).get("/api/tacticboards/share/cross-kind-continuity-token"),
    request(app).get("/api/practice-plans/share/cross-kind-continuity-token"),
  ]);
  expect(board.status).toBe(200);
  expect(board.body).toMatchObject({
    kind: "tacticBoard",
    name: "Colliding Board",
  });
  expect(plan.status).toBe(200);
  expect(plan.body).toMatchObject({
    kind: "practicePlan",
    name: "Colliding Plan",
  });
});
