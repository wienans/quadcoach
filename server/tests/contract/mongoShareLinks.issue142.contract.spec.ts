import mongoose, { Types } from "mongoose";
import PracticePlanAccess from "../../models/practicePlanAccess";
import { PracticePlan } from "../../models/practicePlan";
import TacticBoardAccess from "../../models/tacticBoardAccess";
import TacticBoard from "../../models/tacticBoard";
import {
  createMongoShareLinkPersistenceAdapters,
  isRelevantShareTokenDuplicateKeyError,
  ProductionShareLinkResourceTypes,
} from "../../shareLinks/mongoShareLinkAdapters";
import { createProductionShareLinks } from "../../shareLinks/productionShareLinks";
import {
  ShareLinkActor,
  ShareLinkCommand,
  ShareLinkError,
} from "../../shareLinks/shareLinks";

jest.setTimeout(30_000);

type ResourceKind = keyof ProductionShareLinkResourceTypes;

interface ResourceMatrixCase<Kind extends ResourceKind> {
  kind: Kind;
  collectionName: "tacticboards" | "practiceplans";
  sharePath: string;
  create(
    ownerId: Types.ObjectId,
    overrides?: Record<string, unknown>,
  ): Promise<{ id: string }>;
  grant(
    actorId: Types.ObjectId,
    resourceId: string,
    access: "view" | "edit",
  ): Promise<void>;
  publishMetadata: ProductionShareLinkResourceTypes[Kind]["publishMetadata"];
  expectedPublishedMetadata: Record<string, unknown>;
  expectedProjectionKeys: readonly string[];
  expectedNestedKeys: readonly string[];
  forbiddenPublishField: "pages" | "sections";
}

type AnyResourceMatrixCase = {
  [Kind in ResourceKind]: ResourceMatrixCase<Kind>;
}[ResourceKind];

const cases = [
  {
    kind: "tacticBoard",
    collectionName: "tacticboards",
    sharePath: "tacticboards/share",
    create: async (ownerId, overrides = {}) => {
      const resource = await TacticBoard.create({
        name: "Issue 142 Board",
        isPrivate: true,
        tags: ["original"],
        creator: "Display Coach",
        description: "Board description",
        coaching_points: "Board coaching points",
        user: ownerId,
        pages: [
          {
            version: "6.0.0",
            objects: [
              {
                uuid: "outer-object",
                type: "group",
                left: 10,
                top: 20,
                width: 30,
                height: 40,
                fill: "red",
                objects: [
                  {
                    type: "text",
                    left: 1,
                    top: 2,
                    width: 3,
                    height: 4,
                    text: "Nested content",
                    _id: new Types.ObjectId(),
                    persistenceOnly: "hidden",
                  },
                ],
              },
            ],
            backgroundImage: {
              type: "image",
              width: 100,
              height: 50,
              src: "court.svg",
            },
          },
        ],
        ...overrides,
      });
      return { id: resource.id };
    },
    grant: async (actorId, resourceId, access) => {
      await TacticBoardAccess.create({
        user: actorId,
        tacticboard: resourceId,
        access,
      });
    },
    publishMetadata: {
      name: "Published Board",
      tags: ["published"],
      description: "Published board description",
      coaching_points: "Published coaching points",
    },
    expectedPublishedMetadata: {
      name: "Published Board",
      tags: ["published"],
      description: "Published board description",
      coaching_points: "Published coaching points",
    },
    expectedProjectionKeys: [
      "coaching_points",
      "creator",
      "description",
      "kind",
      "name",
      "pages",
      "tags",
    ],
    expectedNestedKeys: [
      "fill",
      "height",
      "left",
      "objects",
      "path",
      "strokeDashArray",
      "top",
      "type",
      "uuid",
      "width",
    ],
    forbiddenPublishField: "pages",
  },
  {
    kind: "practicePlan",
    collectionName: "practiceplans",
    sharePath: "practice-plans/share",
    create: async (ownerId, overrides = {}) => {
      const resource = await PracticePlan.create({
        name: "Issue 142 Practice",
        description: "Practice description",
        tags: ["original"],
        sections: [
          {
            name: "Main",
            targetDuration: 45,
            groups: [
              {
                name: "Chasers",
                items: [
                  {
                    kind: "exercise",
                    description: "Passing progression",
                    exerciseId: new Types.ObjectId(),
                    blockId: new Types.ObjectId(),
                    duration: 15,
                  },
                ],
              },
            ],
          },
        ],
        user: ownerId,
        isPrivate: true,
        ...overrides,
      });
      return { id: resource.id };
    },
    grant: async (actorId, resourceId, access) => {
      await PracticePlanAccess.create({
        user: actorId,
        practicePlan: resourceId,
        access,
      });
    },
    publishMetadata: {
      name: "Published Practice",
      description: "Published practice description",
      tags: ["published"],
    },
    expectedPublishedMetadata: {
      name: "Published Practice",
      description: "Published practice description",
      tags: ["published"],
    },
    expectedProjectionKeys: [
      "description",
      "kind",
      "name",
      "sections",
      "tags",
    ],
    expectedNestedKeys: ["groups", "name", "targetDuration"],
    forbiddenPublishField: "sections",
  },
] as const satisfies readonly AnyResourceMatrixCase[];

const actor = (id: Types.ObjectId, roles: string[] = ["user"]): ShareLinkActor =>
  ({ id: id.toString(), roles });

const tokensFrom = (...values: string[]) => {
  let fallback = 0;
  return {
    next: () => values.shift() ?? `fallback-${++fallback}`,
  };
};

const serviceFor = (
  tokens: { next(): string } = tokensFrom("generated-token"),
  maxTokenAttempts = 5,
) =>
  createProductionShareLinks({
    publicBaseUrl: "https://quadcoach.test/deployment/path",
    tokens,
    maxTokenAttempts,
  });

const manage = <Kind extends ResourceKind>(
  service: ReturnType<typeof serviceFor>,
  kind: Kind,
  id: string,
  command: ShareLinkCommand<
    ProductionShareLinkResourceTypes[Kind]["publishMetadata"]
  >,
  managementActor?: ShareLinkActor,
) =>
  service.manage<Kind>({
    actor: managementActor,
    resource: { kind, id },
    command,
  });

const collectionDocument = async (
  testCase: AnyResourceMatrixCase,
  id: string,
) =>
  mongoose.connection
    .collection(testCase.collectionName)
    .findOne({ _id: new Types.ObjectId(id) });

const expectNoPersistenceMetadata = (value: unknown): void => {
  if (Array.isArray(value)) {
    value.forEach(expectNoPersistenceMetadata);
    return;
  }
  if (typeof value !== "object" || value === null) return;
  [
    "_id",
    "__v",
    "createdAt",
    "updatedAt",
    "shareToken",
    "user",
    "owner",
    "isPrivate",
    "persistenceOnly",
  ].forEach((field) => expect(value).not.toHaveProperty(field));
  Object.values(value).forEach(expectNoPersistenceMetadata);
};

beforeAll(async () => {
  await Promise.all([TacticBoard.syncIndexes(), PracticePlan.syncIndexes()]);
});

describe.each(cases)("Mongo Share Link matrix: $kind", (testCase) => {
  it("reports inactive/active status with canonical URLs and preserves a stored token", async () => {
    const ownerId = new Types.ObjectId();
    const inactive = await testCase.create(ownerId);
    const legacyToken = "legacy token/+?#";
    const active = await testCase.create(ownerId, { shareToken: legacyToken });
    const service = serviceFor();

    await expect(
      manage(service, testCase.kind, inactive.id, { type: "status" }, actor(ownerId)),
    ).resolves.toEqual({ state: "inactive", outcome: "status" });
    await expect(
      manage(service, testCase.kind, active.id, { type: "status" }, actor(ownerId)),
    ).resolves.toEqual({
      state: "active",
      outcome: "status",
      url: `https://quadcoach.test/${testCase.sharePath}/legacy%20token%2F%2B%3F%23`,
    });
    expect(await collectionDocument(testCase, active.id)).toMatchObject({
      shareToken: legacyToken,
    });
    await expect(service.resolve(testCase.kind, legacyToken)).resolves.toMatchObject({
      kind: testCase.kind,
    });
  });

  it("delegates management authority for Owner, mixed-case Admin, and Access", async () => {
    const ownerId = new Types.ObjectId();
    const editorId = new Types.ObjectId();
    const viewerId = new Types.ObjectId();
    const unrelatedId = new Types.ObjectId();
    const resource = await testCase.create(ownerId);
    await Promise.all([
      testCase.grant(editorId, resource.id, "edit"),
      testCase.grant(viewerId, resource.id, "view"),
    ]);
    const service = serviceFor();

    for (const allowedActor of [
      actor(ownerId),
      actor(new Types.ObjectId(), ["UsEr", "AdMiN"]),
      actor(editorId),
    ]) {
      await expect(
        manage(
          service,
          testCase.kind,
          resource.id,
          { type: "status" },
          allowedActor,
        ),
      ).resolves.toEqual({ state: "inactive", outcome: "status" });
    }

    for (const deniedActor of [actor(viewerId), actor(unrelatedId)]) {
      await expect(
        manage(
          service,
          testCase.kind,
          resource.id,
          { type: "status" },
          deniedActor,
        ),
      ).rejects.toMatchObject({ code: "forbidden" });
    }
    await expect(
      manage(service, testCase.kind, resource.id, { type: "status" }),
    ).rejects.toMatchObject({ code: "authenticationRequired" });
  });

  it("ensures only Private inactive resources, retries collisions, reuses, exhausts, and converges", async () => {
    const ownerId = new Types.ObjectId();
    const occupied = await testCase.create(ownerId, { shareToken: "collision" });
    const resource = await testCase.create(ownerId);
    const service = serviceFor(tokensFrom("collision", "winner"));

    await expect(
      manage(service, testCase.kind, resource.id, { type: "ensure" }, actor(ownerId)),
    ).resolves.toEqual({
      state: "active",
      outcome: "created",
      url: `https://quadcoach.test/${testCase.sharePath}/winner`,
    });
    await expect(
      manage(service, testCase.kind, resource.id, { type: "ensure" }, actor(ownerId)),
    ).resolves.toEqual({
      state: "active",
      outcome: "existing",
      url: `https://quadcoach.test/${testCase.sharePath}/winner`,
    });

    const exhausted = await testCase.create(ownerId);
    await expect(
      manage(
        serviceFor(tokensFrom("collision", "collision"), 2),
        testCase.kind,
        exhausted.id,
        { type: "ensure" },
        actor(ownerId),
      ),
    ).rejects.toMatchObject({ code: "tokenGenerationExhausted" });

    const concurrent = await testCase.create(ownerId);
    const adapter = createMongoShareLinkPersistenceAdapters()[testCase.kind];
    const results = await Promise.all([
      adapter.ensure(concurrent.id, "concurrent-one"),
      adapter.ensure(concurrent.id, "concurrent-two"),
    ]);
    expect(results.map((result) => result.outcome).sort()).toEqual([
      "created",
      "existing",
    ]);
    const winningTokens = results.flatMap((result) =>
      "token" in result ? [result.token] : [],
    );
    expect(new Set(winningTokens).size).toBe(1);

    const publicResource = await testCase.create(ownerId, { isPrivate: false });
    await expect(
      manage(
        serviceFor(),
        testCase.kind,
        publicResource.id,
        { type: "ensure" },
        actor(ownerId),
      ),
    ).rejects.toMatchObject({ code: "privateResourceRequired" });
    expect(await collectionDocument(testCase, occupied.id)).toMatchObject({
      shareToken: "collision",
    });
  });

  it("rotates with CAS, retries collisions, rejects inactive links, and linearizes concurrency", async () => {
    const ownerId = new Types.ObjectId();
    await testCase.create(ownerId, { shareToken: "rotation-collision" });
    const resource = await testCase.create(ownerId, { shareToken: "old-token" });
    const service = serviceFor(
      tokensFrom("old-token", "rotation-collision", "new-token"),
    );

    await expect(
      manage(service, testCase.kind, resource.id, { type: "rotate" }, actor(ownerId)),
    ).resolves.toEqual({
      state: "active",
      outcome: "rotated",
      url: `https://quadcoach.test/${testCase.sharePath}/new-token`,
    });
    await expect(service.resolve(testCase.kind, "old-token")).rejects.toMatchObject({
      code: "shareLinkNotFound",
    });
    await expect(
      service.resolve(testCase.kind, "new-token"),
    ).resolves.toMatchObject({ kind: testCase.kind });
    expect(await collectionDocument(testCase, resource.id)).toMatchObject({
      shareToken: "new-token",
    });

    const inactive = await testCase.create(ownerId);
    await expect(
      manage(
        serviceFor(),
        testCase.kind,
        inactive.id,
        { type: "rotate" },
        actor(ownerId),
      ),
    ).rejects.toMatchObject({ code: "shareLinkInactive" });

    const adapter = createMongoShareLinkPersistenceAdapters()[testCase.kind];
    await expect(
      adapter.rotate(resource.id, "stale-token", "unused-token"),
    ).resolves.toEqual({ outcome: "conflict" });
    const concurrentResults = await Promise.all([
      adapter.rotate(resource.id, "new-token", "concurrent-rotate-one"),
      adapter.rotate(resource.id, "new-token", "concurrent-rotate-two"),
    ]);
    expect(concurrentResults.map((result) => result.outcome).sort()).toEqual([
      "conflict",
      "rotated",
    ]);
  });

  it("revokes idempotently and publishes allowlisted metadata with atomic invalidation", async () => {
    const ownerId = new Types.ObjectId();
    const resource = await testCase.create(ownerId, { shareToken: "revoked-token" });
    const service = serviceFor();

    await expect(
      manage(service, testCase.kind, resource.id, { type: "revoke" }, actor(ownerId)),
    ).resolves.toEqual({ state: "inactive", outcome: "revoked" });
    await expect(
      manage(service, testCase.kind, resource.id, { type: "revoke" }, actor(ownerId)),
    ).resolves.toEqual({ state: "inactive", outcome: "revoked" });
    expect(await collectionDocument(testCase, resource.id)).not.toHaveProperty(
      "shareToken",
    );

    await manage(
      serviceFor(tokensFrom("publish-token")),
      testCase.kind,
      resource.id,
      { type: "ensure" },
      actor(ownerId),
    );
    const forgedOwner = new Types.ObjectId();
    const metadata = {
      ...testCase.publishMetadata,
      user: forgedOwner,
      owner: forgedOwner,
      isPrivate: true,
      shareToken: "forged-token",
      [testCase.forbiddenPublishField]: [],
      arbitrary: "hidden",
    };
    await expect(
      manage(
        service,
        testCase.kind,
        resource.id,
        { type: "publish", validatedMetadata: metadata },
        actor(ownerId),
      ),
    ).resolves.toEqual({ state: "inactive", outcome: "published" });

    const published = await collectionDocument(testCase, resource.id);
    expect(published).toMatchObject({
      ...testCase.expectedPublishedMetadata,
      user: ownerId,
      isPrivate: false,
    });
    expect(published).not.toHaveProperty("shareToken");
    expect(published).not.toHaveProperty("owner");
    expect(published).not.toHaveProperty("arbitrary");
    expect(published?.[testCase.forbiddenPublishField]).not.toEqual([]);
    await expect(
      service.resolve(testCase.kind, "publish-token"),
    ).rejects.toMatchObject({ code: "shareLinkNotFound" });

    await mongoose.connection.collection(testCase.collectionName).updateOne(
      { _id: new Types.ObjectId(resource.id) },
      { $set: { isPrivate: true } },
    );
    const reprivatized = await collectionDocument(testCase, resource.id);
    expect(reprivatized?.isPrivate).toBe(true);
    expect(reprivatized).not.toHaveProperty("shareToken");
  });

  it("resolves exact kind/private/token state through exact recursive content allowlists", async () => {
    const ownerId = new Types.ObjectId();
    const resource = await testCase.create(ownerId, {
      shareToken: "projection-token",
    });
    await mongoose.connection.collection(testCase.collectionName).updateOne(
      { _id: new Types.ObjectId(resource.id) },
      {
        $set: {
          persistenceOnly: "hidden",
          ...(testCase.kind === "tacticBoard"
            ? {
                "pages.0.objects.0.persistenceOnly": "hidden",
                "pages.0.objects.0.objects.0.persistenceOnly": "hidden",
              }
            : {
                "sections.0.persistenceOnly": "hidden",
                "sections.0.groups.0.persistenceOnly": "hidden",
                "sections.0.groups.0.items.0.persistenceOnly": "hidden",
              }),
        },
      },
    );
    const service = serviceFor();

    const projection = await service.resolve(testCase.kind, "projection-token");
    expect(Object.keys(projection).sort()).toEqual(
      [...testCase.expectedProjectionKeys].sort(),
    );
    const nested =
      projection.kind === "tacticBoard"
        ? projection.pages?.[0]?.objects?.[0]
        : projection.sections[0];
    expect(Object.keys(nested ?? {}).sort()).toEqual(
      [...testCase.expectedNestedKeys].sort(),
    );
    if (projection.kind === "tacticBoard") {
      expect(projection).toMatchObject({
        name: "Issue 142 Board",
        tags: ["original"],
        creator: "Display Coach",
        description: "Board description",
        coaching_points: "Board coaching points",
        pages: [
          {
            version: "6.0.0",
            backgroundImage: {
              type: "image",
              width: 100,
              height: 50,
              src: "court.svg",
            },
            objects: [
              {
                uuid: "outer-object",
                type: "group",
                left: 10,
                top: 20,
                width: 30,
                height: 40,
                fill: "red",
                objects: [
                  {
                    type: "text",
                    left: 1,
                    top: 2,
                    width: 3,
                    height: 4,
                    text: "Nested content",
                  },
                ],
              },
            ],
          },
        ],
      });
    } else {
      expect(projection).toMatchObject({
        name: "Issue 142 Practice",
        description: "Practice description",
        tags: ["original"],
        sections: [
          {
            name: "Main",
            targetDuration: 45,
            groups: [
              {
                name: "Chasers",
                items: [
                  {
                    kind: "exercise",
                    description: "Passing progression",
                    duration: 15,
                  },
                ],
              },
            ],
          },
        ],
      });
      const item = projection.sections[0]?.groups[0]?.items[0];
      expect(item?.exerciseId).toMatch(/^[a-f\d]{24}$/);
      expect(item?.blockId).toMatch(/^[a-f\d]{24}$/);
    }
    expectNoPersistenceMetadata(projection);

    const wrongKind: ResourceKind =
      testCase.kind === "tacticBoard" ? "practicePlan" : "tacticBoard";
    const wrongKindError = await service
      .resolve(wrongKind, "projection-token")
      .catch((error: unknown) => error);
    const unknownError = await service
      .resolve(testCase.kind, "unknown-token")
      .catch((error: unknown) => error);
    expect(wrongKindError).toBeInstanceOf(ShareLinkError);
    expect(unknownError).toBeInstanceOf(ShareLinkError);
    if (
      !(wrongKindError instanceof ShareLinkError) ||
      !(unknownError instanceof ShareLinkError)
    ) {
      throw new Error("Expected typed Share Link errors");
    }
    expect({
      code: wrongKindError.code,
      message: wrongKindError.message,
    }).toEqual({
      code: unknownError.code,
      message: unknownError.message,
    });

    await mongoose.connection.collection(testCase.collectionName).updateOne(
      { _id: new Types.ObjectId(resource.id) },
      { $set: { isPrivate: false } },
    );
    await expect(
      service.resolve(testCase.kind, "projection-token"),
    ).rejects.toMatchObject({ code: "shareLinkNotFound" });
  });
});

describe("Share Link duplicate-key classification", () => {
  it.each(cases)(
    "classifies only the $collectionName shareToken index for $kind",
    (testCase) => {
      expect(
        isRelevantShareTokenDuplicateKeyError(
          {
            code: 11000,
            keyPattern: { shareToken: 1 },
            keyValue: { shareToken: "collision" },
            ns: `test.${testCase.collectionName}`,
          },
          testCase.collectionName,
        ),
      ).toBe(true);
      expect(
        isRelevantShareTokenDuplicateKeyError(
          {
            code: 11000,
            keyPattern: { user: 1 },
            keyValue: { user: "duplicate-owner" },
            ns: `test.${testCase.collectionName}`,
          },
          testCase.collectionName,
        ),
      ).toBe(false);
      expect(
        isRelevantShareTokenDuplicateKeyError(
          {
            code: 11000,
            keyPattern: { shareToken: 1 },
            keyValue: { shareToken: "collision" },
            ns: "test.unrelatedresources",
          },
          testCase.collectionName,
        ),
      ).toBe(false);
      expect(
        isRelevantShareTokenDuplicateKeyError(
          { code: 11000 },
          testCase.collectionName,
        ),
      ).toBe(false);
    },
  );

  it.each(cases)(
    "propagates an unrelated $collectionName duplicate as infrastructure without retrying",
    async (testCase) => {
      const ownerId = new Types.ObjectId();
      const target = await testCase.create(ownerId);
      const blocker = await testCase.create(ownerId);
      const fixedTime = new Date("2026-07-18T12:00:00.000Z");
      const collection = mongoose.connection.collection(testCase.collectionName);
      await collection.updateOne(
        { _id: new Types.ObjectId(target.id) },
        { $set: { updatedAt: new Date(fixedTime.getTime() - 1_000) } },
      );
      await collection.updateOne(
        { _id: new Types.ObjectId(blocker.id) },
        { $set: { updatedAt: fixedTime } },
      );
      const indexName = `issue142_${testCase.kind}_updatedAt_unique`;
      await collection.createIndex({ updatedAt: 1 }, { name: indexName, unique: true });
      jest.useFakeTimers({
        doNotFake: [
          "nextTick",
          "setImmediate",
          "clearImmediate",
          "setTimeout",
          "clearTimeout",
          "setInterval",
          "clearInterval",
          "queueMicrotask",
        ],
      });
      jest.setSystemTime(fixedTime);
      let tokenCalls = 0;

      try {
        await expect(
          manage(
            createProductionShareLinks({
              publicBaseUrl: "https://quadcoach.test",
              maxTokenAttempts: 3,
              tokens: {
                next: () => `not-a-share-collision-${++tokenCalls}`,
              },
            }),
            testCase.kind,
            target.id,
            { type: "ensure" },
            actor(ownerId),
          ),
        ).rejects.toMatchObject({
          code: 11000,
          keyPattern: { updatedAt: 1 },
        });
        expect(tokenCalls).toBe(1);
      } finally {
        jest.useRealTimers();
        await collection.dropIndex(indexName);
      }
    },
  );
});
