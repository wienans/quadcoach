export type ShareLinkResourceKind = "tacticBoard" | "practicePlan";

export interface ShareLinkActor {
  id: string;
  roles: readonly string[];
}

export interface ShareLinkResourceRef<
  Kind extends ShareLinkResourceKind = ShareLinkResourceKind,
> {
  kind: Kind;
  id: string;
}

export interface ShareLinkResourceState {
  ownerId?: string;
  isPrivate: boolean;
  activeToken?: string;
}

export type ShareLinkAuthorityDecision =
  | { allowed: true; basis?: string }
  | {
      allowed: false;
      reason: "authenticationRequired" | "forbidden";
    };

export interface ShareLinkManagementAuthority {
  decide(request: {
    actor?: ShareLinkActor;
    resource: ShareLinkResourceRef & {
      ownerId?: string;
      isPrivate: boolean;
    };
  }): Promise<ShareLinkAuthorityDecision>;
}

export type EnsureShareLinkResult =
  | { outcome: "created" | "existing"; token: string }
  | { outcome: "collision" | "missing" | "public" };

export type RotateShareLinkResult =
  | { outcome: "rotated"; token: string }
  | {
      outcome:
        | "collision"
        | "conflict"
        | "inactive"
        | "missing"
        | "public";
    };

export type RevokeShareLinkResult =
  | { outcome: "revoked" | "inactive" }
  | { outcome: "missing" | "public" };

export type PublishShareLinkResult =
  | { outcome: "published" }
  | { outcome: "missing" | "public" };

export interface ShareLinkPersistenceAdapter<
  ValidatedPublishMetadata,
  SharedResource,
> {
  isValidId(id: string): boolean;
  inspect(id: string): Promise<ShareLinkResourceState | null>;
  // A lost install race returns the winning token as existing. Collision is
  // reserved for the resource kind's Share Link token uniqueness constraint.
  ensure(id: string, candidateToken: string): Promise<EnsureShareLinkResult>;
  // The persistence operation compare-and-sets the exact expected active token.
  rotate(
    id: string,
    expectedToken: string,
    candidateToken: string,
  ): Promise<RotateShareLinkResult>;
  // Revoke atomically removes any active token and reports inactive as success.
  revoke(id: string): Promise<RevokeShareLinkResult>;
  // Metadata, Public visibility, and token removal are one atomic write.
  publish(
    id: string,
    validatedMetadata: ValidatedPublishMetadata,
  ): Promise<PublishShareLinkResult>;
  // Match exact { Private, token } state and return an allowlisted projection.
  resolveActivePrivate(token: string): Promise<SharedResource | null>;
}

export interface ShareLinkResourceContract {
  publishMetadata: unknown;
  sharedResource: unknown;
}

export type ShareLinkResourceTypes = Record<
  ShareLinkResourceKind,
  ShareLinkResourceContract
>;

export type ShareLinkPersistenceAdapters<
  ResourceTypes extends ShareLinkResourceTypes,
> = {
  [Kind in ShareLinkResourceKind]: ShareLinkPersistenceAdapter<
    ResourceTypes[Kind]["publishMetadata"],
    ResourceTypes[Kind]["sharedResource"]
  >;
};

export type ShareLinkCommand<ValidatedPublishMetadata> =
  | { type: "status" }
  | { type: "ensure" }
  | { type: "rotate" }
  | { type: "revoke" }
  | {
      type: "publish";
      validatedMetadata: ValidatedPublishMetadata;
    };

export interface ManageShareLinkRequest<
  ResourceTypes extends ShareLinkResourceTypes,
  Kind extends ShareLinkResourceKind,
> {
  actor?: ShareLinkActor;
  resource: ShareLinkResourceRef<Kind>;
  command: ShareLinkCommand<ResourceTypes[Kind]["publishMetadata"]>;
}

export type ShareLinkManagementResult =
  | {
      state: "inactive";
      outcome: "status" | "revoked" | "published";
    }
  | {
      state: "active";
      outcome: "status" | "created" | "existing" | "rotated";
      url: string;
    };

export interface ShareLinks<ResourceTypes extends ShareLinkResourceTypes> {
  manage<Kind extends ShareLinkResourceKind>(
    request: ManageShareLinkRequest<ResourceTypes, Kind>,
  ): Promise<ShareLinkManagementResult>;
  resolve<Kind extends ShareLinkResourceKind>(
    kind: Kind,
    token: string,
  ): Promise<ResourceTypes[Kind]["sharedResource"]>;
}

export type ShareLinkErrorCode =
  | "invalidResourceId"
  | "authenticationRequired"
  | "forbidden"
  | "resourceNotFound"
  | "privateResourceRequired"
  | "shareLinkInactive"
  | "shareLinkConflict"
  | "shareLinkNotFound"
  | "tokenGenerationExhausted";

export class ShareLinkError extends Error {
  constructor(
    readonly code: ShareLinkErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ShareLinkError";
    Object.setPrototypeOf(this, ShareLinkError.prototype);
  }
}

export interface ShareLinkDependencies<
  ResourceTypes extends ShareLinkResourceTypes,
> {
  authority: ShareLinkManagementAuthority;
  persistence: ShareLinkPersistenceAdapters<ResourceTypes>;
  tokens: { next(): string };
  publicBaseUrl: string;
  maxTokenAttempts?: number;
}

const sharePathByKind: Record<ShareLinkResourceKind, string> = {
  tacticBoard: "tacticboards/share",
  practicePlan: "practice-plans/share",
};

const messageByCode: Record<ShareLinkErrorCode, string> = {
  invalidResourceId: "Invalid resource ID",
  authenticationRequired: "Authentication required",
  forbidden: "Share Link management is forbidden",
  resourceNotFound: "Resource not found",
  privateResourceRequired: "Share Links require a Private resource",
  shareLinkInactive: "Share Link is inactive",
  shareLinkConflict: "Share Link changed during the operation",
  shareLinkNotFound: "Share Link not found",
  tokenGenerationExhausted: "Could not generate a unique Share Link token",
};

const fail = (code: ShareLinkErrorCode): never => {
  throw new ShareLinkError(code, messageByCode[code]);
};

export function createShareLinks<ResourceTypes extends ShareLinkResourceTypes>(
  dependencies: ShareLinkDependencies<ResourceTypes>,
): ShareLinks<ResourceTypes> {
  const maxTokenAttempts = dependencies.maxTokenAttempts ?? 5;
  if (!Number.isInteger(maxTokenAttempts) || maxTokenAttempts < 1) {
    throw new RangeError("maxTokenAttempts must be a positive integer");
  }

  const configuredBaseUrl = new URL(dependencies.publicBaseUrl);
  if (
    configuredBaseUrl.protocol !== "http:" &&
    configuredBaseUrl.protocol !== "https:"
  ) {
    throw new TypeError("publicBaseUrl must be an absolute HTTP(S) URL");
  }
  const publicOrigin = configuredBaseUrl.origin;

  const urlFor = (kind: ShareLinkResourceKind, token: string): string =>
    new URL(
      `/${sharePathByKind[kind]}/${encodeURIComponent(token)}`,
      publicOrigin,
    ).toString();

  const mapResourceOutcome = (outcome: "missing" | "public"): never => {
    if (outcome === "missing") return fail("resourceNotFound");
    return fail("privateResourceRequired");
  };

  const manage = async <Kind extends ShareLinkResourceKind>(
    request: ManageShareLinkRequest<ResourceTypes, Kind>,
  ): Promise<ShareLinkManagementResult> => {
    const adapter = dependencies.persistence[request.resource.kind];
    if (!adapter.isValidId(request.resource.id)) return fail("invalidResourceId");

    const state = await adapter.inspect(request.resource.id);
    if (!state) return fail("resourceNotFound");

    const authorityDecision = await dependencies.authority.decide({
      actor: request.actor,
      resource: {
        ...request.resource,
        ownerId: state.ownerId,
        isPrivate: state.isPrivate,
      },
    });
    if (!authorityDecision.allowed) return fail(authorityDecision.reason);
    if (!state.isPrivate) return fail("privateResourceRequired");

    switch (request.command.type) {
      case "status": {
        const activeToken = state.activeToken;
        return activeToken
          ? {
              state: "active",
              outcome: "status",
              url: urlFor(request.resource.kind, activeToken),
            }
          : { state: "inactive", outcome: "status" };
      }

      case "ensure":
        for (let attempt = 0; attempt < maxTokenAttempts; attempt += 1) {
          const result = await adapter.ensure(
            request.resource.id,
            dependencies.tokens.next(),
          );
          if (result.outcome === "created" || result.outcome === "existing") {
            return {
              state: "active",
              outcome: result.outcome,
              url: urlFor(request.resource.kind, result.token),
            };
          }
          if (result.outcome !== "collision") {
            return mapResourceOutcome(result.outcome);
          }
        }
        return fail("tokenGenerationExhausted");

      case "rotate": {
        const expectedToken = state.activeToken;
        if (!expectedToken) return fail("shareLinkInactive");
        for (let attempt = 0; attempt < maxTokenAttempts; attempt += 1) {
          const candidateToken = dependencies.tokens.next();
          if (candidateToken === expectedToken) continue;
          const result = await adapter.rotate(
            request.resource.id,
            expectedToken,
            candidateToken,
          );
          if (result.outcome === "rotated") {
            return {
              state: "active",
              outcome: "rotated",
              url: urlFor(request.resource.kind, result.token),
            };
          }
          if (result.outcome === "collision") continue;
          if (result.outcome === "conflict") return fail("shareLinkConflict");
          if (result.outcome === "inactive") return fail("shareLinkInactive");
          return mapResourceOutcome(result.outcome);
        }
        return fail("tokenGenerationExhausted");
      }

      case "revoke": {
        const result = await adapter.revoke(request.resource.id);
        if (result.outcome === "missing" || result.outcome === "public") {
          return mapResourceOutcome(result.outcome);
        }
        return { state: "inactive", outcome: "revoked" };
      }

      case "publish": {
        const result = await adapter.publish(
          request.resource.id,
          request.command.validatedMetadata,
        );
        if (result.outcome === "missing" || result.outcome === "public") {
          return mapResourceOutcome(result.outcome);
        }
        return { state: "inactive", outcome: "published" };
      }
    }
  };

  const resolve = async <Kind extends ShareLinkResourceKind>(
    kind: Kind,
    token: string,
  ): Promise<ResourceTypes[Kind]["sharedResource"]> => {
    if (!token) return fail("shareLinkNotFound");
    const resource = await dependencies.persistence[
      kind
    ].resolveActivePrivate(token);
    if (!resource) return fail("shareLinkNotFound");
    return resource;
  };

  return { manage, resolve };
}
