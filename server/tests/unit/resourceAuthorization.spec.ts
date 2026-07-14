import {
  AccessGrantAdapter,
  createResourceAuthorization,
  ResourceAuthorizationRequest,
  ResourceType,
} from "../../authorization/resourceAuthorization";

jest.setTimeout(30_000);

const noGrant: AccessGrantAdapter = {
  findAccessLevel: jest.fn().mockResolvedValue(null),
};

const withAdapter = (adapter: AccessGrantAdapter) =>
  createResourceAuthorization(
    Object.fromEntries(
      (["exercise", "tacticBoard", "practicePlan"] as ResourceType[]).map(
        (type) => [type, adapter],
      ),
    ) as Record<ResourceType, AccessGrantAdapter>,
  );

const decideResourceAuthorization = withAdapter(noGrant);

const request = (
  overrides: Partial<ResourceAuthorizationRequest> = {},
): ResourceAuthorizationRequest => ({
  action: "view",
  actor: undefined,
  resource: {
    type: "tacticBoard",
    id: "resource-id",
    ownerId: "owner-id",
    isPrivate: false,
  },
  ...overrides,
});

describe("decideResourceAuthorization", () => {
  it("allows an anonymous visitor to view a Public resource", async () => {
    await expect(
      decideResourceAuthorization(request()),
    ).resolves.toEqual({ allowed: true, basis: "public" });
  });

  const actorCases: Record<
    "anonymous" | "unrelated" | "owner" | "admin",
    ResourceAuthorizationRequest["actor"]
  > = {
    anonymous: undefined,
    unrelated: { id: "other-id", roles: ["user"] },
    owner: { id: "owner-id", roles: ["user"] },
    admin: { id: "admin-id", roles: ["AdMiN"] },
  };

  const exhaustiveActors = [
    {
      name: "anonymous",
      actor: undefined,
      grant: null,
      publicActions: ["view"],
      privateActions: [],
    },
    {
      name: "unrelated",
      actor: { id: "unrelated-id", roles: ["user"] },
      grant: null,
      publicActions: ["view"],
      privateActions: [],
    },
    {
      name: "view Access",
      actor: { id: "viewer-id", roles: ["user"] },
      grant: "view",
      publicActions: ["view"],
      privateActions: ["view"],
    },
    {
      name: "edit Access",
      actor: { id: "editor-id", roles: ["user"] },
      grant: "edit",
      publicActions: ["view", "edit"],
      privateActions: ["view", "edit"],
    },
    {
      name: "Owner",
      actor: { id: "owner-id", roles: ["user"] },
      grant: null,
      publicActions: ["view", "edit", "delete", "manageAccess"],
      privateActions: ["view", "edit", "delete", "manageAccess"],
    },
    {
      name: "Admin",
      actor: { id: "admin-id", roles: ["admin"] },
      grant: null,
      publicActions: ["view", "edit", "delete", "manageAccess"],
      privateActions: ["view", "edit", "delete", "manageAccess"],
    },
  ] satisfies Array<{
    name: string;
    actor: ResourceAuthorizationRequest["actor"];
    grant: "view" | "edit" | null;
    publicActions: string[];
    privateActions: string[];
  }>;

  const exhaustiveCases = (
    ["exercise", "tacticBoard", "practicePlan"] as ResourceType[]
  ).flatMap((type) =>
    [false, true].flatMap((isPrivate) =>
      exhaustiveActors.flatMap((actorCase) =>
        (["view", "edit", "delete", "manageAccess"] as const).map(
          (action) => {
            const effectiveVisibility =
              type === "exercise" || !isPrivate ? "public" : "private";
            const allowedActions =
              effectiveVisibility === "public"
                ? actorCase.publicActions
                : actorCase.privateActions;
            return {
              type,
              isPrivate,
              actorCase,
              action,
              allowed: allowedActions.includes(action),
            };
          },
        ),
      ),
    ),
  );

  it.each(exhaustiveCases)(
    "$type isPrivate=$isPrivate: $actorCase.name requesting $action returns allowed=$allowed",
    async ({ type, isPrivate, actorCase, action, allowed }) => {
      const adapter: AccessGrantAdapter = {
        findAccessLevel: jest.fn().mockResolvedValue(actorCase.grant),
      };

      const decision = await withAdapter(adapter)(
        request({
          action,
          actor: actorCase.actor,
          resource: {
            type,
            id: "resource-id",
            ownerId: "owner-id",
            isPrivate,
          },
        }),
      );

      expect(decision.allowed).toBe(allowed);
    },
  );

  it.each([
    ["anonymous", "view", false, true, "public"],
    ["anonymous", "view", true, false, "authenticationRequired"],
    ["anonymous", "edit", false, false, "authenticationRequired"],
    ["unrelated", "view", false, true, "public"],
    ["unrelated", "view", true, false, "forbidden"],
    ["unrelated", "edit", false, false, "forbidden"],
    ["unrelated", "delete", false, false, "forbidden"],
    ["unrelated", "manageAccess", false, false, "forbidden"],
    ["owner", "view", true, true, "owner"],
    ["owner", "edit", true, true, "owner"],
    ["owner", "delete", true, true, "owner"],
    ["owner", "manageAccess", true, true, "owner"],
    ["admin", "view", true, true, "admin"],
    ["admin", "edit", true, true, "admin"],
    ["admin", "delete", true, true, "admin"],
    ["admin", "manageAccess", true, true, "admin"],
  ] as const)(
    "%s requesting %s on isPrivate=%s returns %s",
    async (actorName, action, isPrivate, allowed, detail) => {
      const decision = await decideResourceAuthorization(
        request({
          action,
          actor: actorCases[actorName],
          resource: {
            type: "tacticBoard",
            id: "resource-id",
            ownerId: "owner-id",
            isPrivate,
          },
        }),
      );

      expect(decision.allowed).toBe(allowed);
      if (decision.allowed) {
        expect(decision.basis).toBe(detail);
      } else {
        expect(decision.reason).toBe(detail);
      }
    },
  );

  it.each([
    ["view", "view", true],
    ["view", "edit", false],
    ["view", "delete", false],
    ["view", "manageAccess", false],
    ["edit", "view", true],
    ["edit", "edit", true],
    ["edit", "delete", false],
    ["edit", "manageAccess", false],
  ] as const)(
    "%s Access requesting %s returns allowed=%s",
    async (accessLevel, action, allowed) => {
      const adapter: AccessGrantAdapter = {
        findAccessLevel: jest.fn().mockResolvedValue(accessLevel),
      };
      const decision = await withAdapter(adapter)(
        request({
          action,
          actor: { id: "collaborator-id", roles: ["user"] },
          resource: {
            type: "practicePlan",
            id: "resource-id",
            ownerId: "owner-id",
            isPrivate: true,
          },
        }),
      );

      expect(decision.allowed).toBe(allowed);
      if (allowed) {
        expect(decision).toEqual({
          allowed: true,
          basis: "granted",
          accessLevel,
        });
      } else {
        expect(decision).toEqual({ allowed: false, reason: "forbidden" });
      }
    },
  );

  it.each(["view", "edit", "delete", "manageAccess"] as const)(
    "treats Exercise as Public for %s decisions",
    async (action) => {
      const decision = await decideResourceAuthorization(
        request({
          action,
          resource: {
            type: "exercise",
            id: "resource-id",
            ownerId: "owner-id",
            isPrivate: true,
          },
        }),
      );

      expect(decision.allowed).toBe(action === "view");
    },
  );

  it("preserves granted precedence over Public visibility", async () => {
    const adapter: AccessGrantAdapter = {
      findAccessLevel: jest.fn().mockResolvedValue("edit"),
    };

    await expect(
      withAdapter(adapter)(
        request({ actor: { id: "collaborator-id", roles: ["user"] } }),
      ),
    ).resolves.toEqual({
      allowed: true,
      basis: "granted",
      accessLevel: "edit",
    });
  });

  it("propagates Access adapter failures", async () => {
    const failure = new Error("database unavailable");
    const adapter: AccessGrantAdapter = {
      findAccessLevel: jest.fn().mockRejectedValue(failure),
    };

    await expect(
      withAdapter(adapter)(
        request({
          actor: { id: "collaborator-id", roles: ["user"] },
          resource: {
            type: "practicePlan",
            id: "resource-id",
            ownerId: "owner-id",
            isPrivate: true,
          },
        }),
      ),
    ).rejects.toBe(failure);
  });
});
