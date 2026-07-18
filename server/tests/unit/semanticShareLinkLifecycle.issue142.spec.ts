import {
  createShareLinks,
  ShareLinkError,
  ShareLinkManagementAuthority,
  ShareLinkPersistenceAdapter,
  ShareLinkResourceKind,
} from "../../shareLinks/shareLinks";

interface PublishMetadata {
  name: string;
  tags: readonly string[];
}

interface TacticBoardProjection {
  kind: "tacticBoard";
  name: string;
  pages: readonly string[];
}

interface PracticePlanProjection {
  kind: "practicePlan";
  name: string;
  sections: readonly string[];
}

type TestResourceTypes = {
  tacticBoard: {
    publishMetadata: PublishMetadata;
    sharedResource: TacticBoardProjection;
  };
  practicePlan: {
    publishMetadata: PublishMetadata;
    sharedResource: PracticePlanProjection;
  };
};

interface StoredResource {
  ownerId: string;
  isPrivate: boolean;
  token?: string;
  projection: TacticBoardProjection | PracticePlanProjection;
  publishedMetadata?: unknown;
}

const resourceKey = (kind: ShareLinkResourceKind, id: string): string =>
  `${kind}:${id}`;

const deferred = () => {
  let resolve = (): void => undefined;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

const createHarness = () => {
  const resources = new Map<string, StoredResource>();
  const candidates = ["generated-token"];
  let ensureGate: ReturnType<typeof deferred> | undefined;
  let rotateGate: ReturnType<typeof deferred> | undefined;
  let ensureArrivals = 0;
  let rotateArrivals = 0;

  const seed = (
    kind: ShareLinkResourceKind,
    id: string,
    overrides: Partial<StoredResource> = {},
  ): StoredResource => {
    const projection =
      kind === "tacticBoard"
        ? ({ kind, name: "Board", pages: ["page"] } as const)
        : ({ kind, name: "Plan", sections: ["section"] } as const);
    const state: StoredResource = {
      ownerId: "owner-id",
      isPrivate: true,
      projection,
      ...overrides,
    };
    resources.set(resourceKey(kind, id), state);
    return state;
  };

  const tokenIsUsed = (kind: ShareLinkResourceKind, token: string): boolean =>
    [...resources.entries()].some(
      ([key, value]) => key.startsWith(`${kind}:`) && value.token === token,
    );

  const createAdapter = <Metadata, Projection>(
    kind: ShareLinkResourceKind,
  ): ShareLinkPersistenceAdapter<Metadata, Projection> => ({
    isValidId: (id) => id.startsWith("valid-"),
    inspect: async (id) => {
      const state = resources.get(resourceKey(kind, id));
      return state
        ? {
            ownerId: state.ownerId,
            isPrivate: state.isPrivate,
            activeToken: state.token,
          }
        : null;
    },
    ensure: async (id, candidate) => {
      if (ensureGate) {
        ensureArrivals += 1;
        if (ensureArrivals === 2) ensureGate.resolve();
        await ensureGate.promise;
      }
      const state = resources.get(resourceKey(kind, id));
      if (!state) return { outcome: "missing" };
      if (!state.isPrivate) return { outcome: "public" };
      if (state.token) return { outcome: "existing", token: state.token };
      if (tokenIsUsed(kind, candidate)) return { outcome: "collision" };
      state.token = candidate;
      return { outcome: "created", token: candidate };
    },
    rotate: async (id, expectedToken, candidate) => {
      if (rotateGate) {
        rotateArrivals += 1;
        if (rotateArrivals === 2) rotateGate.resolve();
        await rotateGate.promise;
      }
      const state = resources.get(resourceKey(kind, id));
      if (!state) return { outcome: "missing" };
      if (!state.isPrivate) return { outcome: "public" };
      if (!state.token) return { outcome: "inactive" };
      if (state.token !== expectedToken) return { outcome: "conflict" };
      if (tokenIsUsed(kind, candidate)) return { outcome: "collision" };
      state.token = candidate;
      return { outcome: "rotated", token: candidate };
    },
    revoke: async (id) => {
      const state = resources.get(resourceKey(kind, id));
      if (!state) return { outcome: "missing" };
      if (!state.isPrivate) return { outcome: "public" };
      if (!state.token) return { outcome: "inactive" };
      delete state.token;
      return { outcome: "revoked" };
    },
    publish: async (id, metadata) => {
      const state = resources.get(resourceKey(kind, id));
      if (!state) return { outcome: "missing" };
      if (!state.isPrivate) return { outcome: "public" };
      state.publishedMetadata = metadata;
      state.isPrivate = false;
      delete state.token;
      return { outcome: "published" };
    },
    resolveActivePrivate: async (token) => {
      const state = [...resources.entries()].find(
        ([key, candidate]) =>
          key.startsWith(`${kind}:`) &&
          candidate.isPrivate &&
          candidate.token === token,
      )?.[1];
      return (state?.projection as Projection | undefined) ?? null;
    },
  });

  const authority: ShareLinkManagementAuthority = {
    decide: jest.fn().mockResolvedValue({ allowed: true, basis: "owner" }),
  };
  const persistence = {
    tacticBoard: createAdapter<PublishMetadata, TacticBoardProjection>(
      "tacticBoard",
    ),
    practicePlan: createAdapter<PublishMetadata, PracticePlanProjection>(
      "practicePlan",
    ),
  };
  const shareLinks = createShareLinks<TestResourceTypes>({
    authority,
    persistence,
    tokens: {
      next: () => candidates.shift() ?? "fallback-token",
    },
    publicBaseUrl: "https://quadcoach.test/deployment/",
    maxTokenAttempts: 3,
  });

  return {
    authority,
    candidates,
    persistence,
    resources,
    seed,
    shareLinks,
    waitForConcurrentEnsures: () => {
      ensureGate = deferred();
    },
    waitForConcurrentRotates: () => {
      rotateGate = deferred();
    },
  };
};

const owner = { id: "owner-id", roles: ["user"] };

describe("semantic Share Link lifecycle core", () => {
  it.each([
    [
      "tacticBoard",
      "https://quadcoach.test/tacticboards/share/legacy%20token%2F%2B%3F%23",
    ],
    [
      "practicePlan",
      "https://quadcoach.test/practice-plans/share/legacy%20token%2F%2B%3F%23",
    ],
  ] as const)(
    "reports encoded canonical status URLs for %s without exposing a token",
    async (kind, expectedUrl) => {
      const harness = createHarness();
      harness.seed(kind, "valid-resource", {
        token: "legacy token/+?#",
      });

      const result = await harness.shareLinks.manage({
        actor: owner,
        resource: { kind, id: "valid-resource" },
        command: { type: "status" },
      });

      expect(result).toEqual({
        state: "active",
        outcome: "status",
        url: expectedUrl,
      });
      expect(result).not.toHaveProperty("token");
      expect(harness.authority.decide).toHaveBeenCalledWith({
        actor: owner,
        resource: {
          kind,
          id: "valid-resource",
          ownerId: "owner-id",
          isPrivate: true,
        },
      });
    },
  );

  it("returns typed validation, existence, authority, and eligibility errors", async () => {
    const harness = createHarness();
    harness.seed("tacticBoard", "valid-forbidden");
    harness.seed("tacticBoard", "valid-public", { isPrivate: false });
    (harness.authority.decide as jest.Mock).mockImplementation(
      ({ actor }: { actor?: typeof owner }) =>
        actor
          ? { allowed: false, reason: "forbidden" }
          : { allowed: false, reason: "authenticationRequired" },
    );

    const manage = (id: string, actor?: typeof owner) =>
      harness.shareLinks.manage({
        actor,
        resource: { kind: "tacticBoard", id },
        command: { type: "status" },
      });

    await expect(manage("bad-id", owner)).rejects.toMatchObject({
      name: "ShareLinkError",
      code: "invalidResourceId",
    });
    await expect(manage("valid-missing", owner)).rejects.toMatchObject({
      code: "resourceNotFound",
    });
    await expect(manage("valid-forbidden")).rejects.toMatchObject({
      code: "authenticationRequired",
    });
    await expect(manage("valid-forbidden", owner)).rejects.toMatchObject({
      code: "forbidden",
    });

    (harness.authority.decide as jest.Mock).mockResolvedValue({
      allowed: true,
      basis: "owner",
    });
    await expect(manage("valid-public", owner)).rejects.toMatchObject({
      code: "privateResourceRequired",
    });
  });

  it("retries relevant token collisions and reuses an active token", async () => {
    const harness = createHarness();
    harness.seed("tacticBoard", "valid-resource");
    harness.seed("tacticBoard", "valid-other", { token: "collision" });
    harness.candidates.splice(0, 1, "collision", "winner");

    await expect(
      harness.shareLinks.manage({
        actor: owner,
        resource: { kind: "tacticBoard", id: "valid-resource" },
        command: { type: "ensure" },
      }),
    ).resolves.toEqual({
      state: "active",
      outcome: "created",
      url: "https://quadcoach.test/tacticboards/share/winner",
    });

    await expect(
      harness.shareLinks.manage({
        actor: owner,
        resource: { kind: "tacticBoard", id: "valid-resource" },
        command: { type: "ensure" },
      }),
    ).resolves.toEqual({
      state: "active",
      outcome: "existing",
      url: "https://quadcoach.test/tacticboards/share/winner",
    });
  });

  it("exhausts bounded token retries with a typed error", async () => {
    const harness = createHarness();
    harness.seed("practicePlan", "valid-resource");
    harness.seed("practicePlan", "valid-other", { token: "collision" });
    harness.candidates.splice(0, 1, "collision", "collision", "collision");

    await expect(
      harness.shareLinks.manage({
        actor: owner,
        resource: { kind: "practicePlan", id: "valid-resource" },
        command: { type: "ensure" },
      }),
    ).rejects.toMatchObject({
      code: "tokenGenerationExhausted",
    });
  });

  it("lets concurrent ensures reach adapter CAS and converge on one URL", async () => {
    const harness = createHarness();
    harness.seed("tacticBoard", "valid-resource");
    harness.candidates.splice(0, 1, "candidate-one", "candidate-two");
    harness.waitForConcurrentEnsures();
    const ensure = () =>
      harness.shareLinks.manage({
        actor: owner,
        resource: { kind: "tacticBoard", id: "valid-resource" },
        command: { type: "ensure" } as const,
      });

    const results = await Promise.all([ensure(), ensure()]);

    expect(results.map((result) => result.outcome).sort()).toEqual([
      "created",
      "existing",
    ]);
    expect(
      new Set(
        results.map((result) =>
          result.state === "active" ? result.url : "inactive",
        ),
      ),
    ).toEqual(
      new Set(["https://quadcoach.test/tacticboards/share/candidate-one"]),
    );
  });

  it("rotates by adapter CAS, retries collisions, and reports stale concurrency", async () => {
    const harness = createHarness();
    harness.seed("practicePlan", "valid-resource", { token: "old-token" });
    harness.seed("practicePlan", "valid-other", { token: "collision" });
    harness.candidates.splice(0, 1, "collision", "new-token");
    const rotateSpy = jest.spyOn(harness.persistence.practicePlan, "rotate");

    await expect(
      harness.shareLinks.manage({
        actor: owner,
        resource: { kind: "practicePlan", id: "valid-resource" },
        command: { type: "rotate" },
      }),
    ).resolves.toEqual({
      state: "active",
      outcome: "rotated",
      url: "https://quadcoach.test/practice-plans/share/new-token",
    });
    expect(rotateSpy).toHaveBeenNthCalledWith(
      1,
      "valid-resource",
      "old-token",
      "collision",
    );
    expect(rotateSpy).toHaveBeenNthCalledWith(
      2,
      "valid-resource",
      "old-token",
      "new-token",
    );

    harness.candidates.push("concurrent-one", "concurrent-two");
    harness.waitForConcurrentRotates();
    const rotate = () =>
      harness.shareLinks.manage({
        actor: owner,
        resource: { kind: "practicePlan", id: "valid-resource" },
        command: { type: "rotate" } as const,
      });
    const results = await Promise.allSettled([rotate(), rotate()]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(
      1,
    );
    const rejected = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    expect(rejected?.reason).toBeInstanceOf(ShareLinkError);
    expect(rejected?.reason).toMatchObject({ code: "shareLinkConflict" });
  });

  it.each(["tacticBoard", "practicePlan"] as const)(
    "retries the active %s token candidate and invalidates it after rotation",
    async (kind) => {
      const harness = createHarness();
      harness.seed(kind, "valid-resource", { token: "old-token" });
      harness.candidates.splice(0, 1, "old-token", "replacement-token");
      const rotateSpy = jest.spyOn(harness.persistence[kind], "rotate");

      await expect(
        harness.shareLinks.manage({
          actor: owner,
          resource: { kind, id: "valid-resource" },
          command: { type: "rotate" },
        }),
      ).resolves.toEqual({
        state: "active",
        outcome: "rotated",
        url:
          kind === "tacticBoard"
            ? "https://quadcoach.test/tacticboards/share/replacement-token"
            : "https://quadcoach.test/practice-plans/share/replacement-token",
      });
      expect(rotateSpy).toHaveBeenCalledTimes(1);
      expect(rotateSpy).toHaveBeenCalledWith(
        "valid-resource",
        "old-token",
        "replacement-token",
      );
      await expect(
        harness.shareLinks.resolve(kind, "old-token"),
      ).rejects.toMatchObject({ code: "shareLinkNotFound" });
      await expect(
        harness.shareLinks.resolve(kind, "replacement-token"),
      ).resolves.toMatchObject({ kind });
    },
  );

  it("exhausts normally when rotation repeatedly generates the active token", async () => {
    const harness = createHarness();
    harness.seed("tacticBoard", "valid-resource", { token: "old-token" });
    harness.candidates.splice(0, 1, "old-token", "old-token", "old-token");
    const rotateSpy = jest.spyOn(harness.persistence.tacticBoard, "rotate");

    await expect(
      harness.shareLinks.manage({
        actor: owner,
        resource: { kind: "tacticBoard", id: "valid-resource" },
        command: { type: "rotate" },
      }),
    ).rejects.toMatchObject({ code: "tokenGenerationExhausted" });
    expect(rotateSpy).not.toHaveBeenCalled();
  });

  it("rejects rotation when no link is active", async () => {
    const harness = createHarness();
    harness.seed("tacticBoard", "valid-resource");

    await expect(
      harness.shareLinks.manage({
        actor: owner,
        resource: { kind: "tacticBoard", id: "valid-resource" },
        command: { type: "rotate" },
      }),
    ).rejects.toMatchObject({ code: "shareLinkInactive" });
  });

  it("revokes atomically and remains idempotent when inactive", async () => {
    const harness = createHarness();
    const state = harness.seed("tacticBoard", "valid-resource", {
      token: "active-token",
    });

    const revoke = () =>
      harness.shareLinks.manage({
        actor: owner,
        resource: { kind: "tacticBoard", id: "valid-resource" },
        command: { type: "revoke" } as const,
      });
    await expect(revoke()).resolves.toEqual({
      state: "inactive",
      outcome: "revoked",
    });
    await expect(revoke()).resolves.toEqual({
      state: "inactive",
      outcome: "revoked",
    });
    expect(state.token).toBeUndefined();
  });

  it.each(["tacticBoard", "practicePlan"] as const)(
    "publishes %s metadata and removes privacy/token in one adapter command",
    async (kind) => {
      const harness = createHarness();
      const state = harness.seed(kind, "valid-resource", {
        token: "active-token",
      });
      const metadata = { name: "Published resource", tags: ["press"] };

      await expect(
        harness.shareLinks.manage({
          actor: owner,
          resource: { kind, id: "valid-resource" },
          command: { type: "publish", validatedMetadata: metadata },
        }),
      ).resolves.toEqual({ state: "inactive", outcome: "published" });
      expect(state).toMatchObject({
        isPrivate: false,
        publishedMetadata: metadata,
      });
      expect(state.token).toBeUndefined();
    },
  );

  it("resolves only the adapter's exact active Private token projection", async () => {
    const harness = createHarness();
    const state = harness.seed("practicePlan", "valid-resource", {
      token: "active-token",
    });

    await expect(
      harness.shareLinks.resolve("practicePlan", "active-token"),
    ).resolves.toEqual({
      kind: "practicePlan",
      name: "Plan",
      sections: ["section"],
    });
    await expect(
      harness.shareLinks.resolve("tacticBoard", "active-token"),
    ).rejects.toMatchObject({ code: "shareLinkNotFound" });

    state.isPrivate = false;
    await expect(
      harness.shareLinks.resolve("practicePlan", "active-token"),
    ).rejects.toMatchObject({ code: "shareLinkNotFound" });
    await expect(
      harness.shareLinks.resolve("practicePlan", ""),
    ).rejects.toMatchObject({ code: "shareLinkNotFound" });
  });
});
