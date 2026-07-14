import ExerciseAccess from "../models/exerciseAccess";
import PracticePlanAccess from "../models/practicePlanAccess";
import TacticboardAccess from "../models/tacticboardAccess";

export type ResourceType = "exercise" | "tacticBoard" | "practicePlan";

export type ResourceAction = "view" | "edit" | "delete" | "manageAccess";

export type AccessLevel = "view" | "edit";

export interface ResourceAuthorizationActor {
  id: string;
  roles: string[];
}

export interface ResourceAuthorizationResource {
  type: ResourceType;
  id: string;
  ownerId?: string;
  isPrivate: boolean;
}

interface OwnedResource {
  user?: { toString(): string } | null;
}

interface PrivateResource extends OwnedResource {
  isPrivate?: boolean | null;
}

export const authorizationResourceFor = {
  exercise(
    id: string,
    resource: OwnedResource,
  ): ResourceAuthorizationResource {
    return {
      type: "exercise",
      id,
      ownerId: resource.user?.toString(),
      isPrivate: false,
    };
  },
  tacticBoard(
    id: string,
    resource: PrivateResource,
  ): ResourceAuthorizationResource {
    return {
      type: "tacticBoard",
      id,
      ownerId: resource.user?.toString(),
      isPrivate: resource.isPrivate ?? false,
    };
  },
  practicePlan(
    id: string,
    resource: PrivateResource,
  ): ResourceAuthorizationResource {
    return {
      type: "practicePlan",
      id,
      ownerId: resource.user?.toString(),
      isPrivate: resource.isPrivate ?? false,
    };
  },
};

export interface ResourceAuthorizationRequest {
  action: ResourceAction;
  actor?: ResourceAuthorizationActor;
  resource: ResourceAuthorizationResource;
}

export interface AccessGrantAdapter {
  findAccessLevel(
    userId: string,
    resourceId: string,
  ): Promise<AccessLevel | null>;
}

export type AccessGrantAdapters = Record<ResourceType, AccessGrantAdapter>;

export type ResourceAuthorizationDecision =
  | {
      allowed: true;
      basis: "owner" | "admin" | "public";
    }
  | {
      allowed: true;
      basis: "granted";
      accessLevel: AccessLevel;
    }
  | {
      allowed: false;
      reason: "authenticationRequired" | "forbidden";
    };

export function createResourceAuthorization(
  accessGrantAdapters: AccessGrantAdapters,
): (
  request: ResourceAuthorizationRequest,
) => Promise<ResourceAuthorizationDecision> {
  return async function decide(
    request: ResourceAuthorizationRequest,
  ): Promise<ResourceAuthorizationDecision> {
    const { action, actor, resource } = request;
    const isPublic = resource.type === "exercise" || !resource.isPrivate;

    if (actor?.id === resource.ownerId) {
      return { allowed: true, basis: "owner" };
    }

    if (actor?.roles.some((role) => role.toLowerCase() === "admin")) {
      return { allowed: true, basis: "admin" };
    }

    if (actor && (action === "view" || action === "edit")) {
      const accessLevel = await accessGrantAdapters[
        resource.type
      ].findAccessLevel(actor.id, resource.id);

      if (
        accessLevel === "edit" ||
        (accessLevel === "view" && action === "view")
      ) {
        return { allowed: true, basis: "granted", accessLevel };
      }
    }

    if (action === "view" && isPublic) {
      return { allowed: true, basis: "public" };
    }

    return actor
      ? { allowed: false, reason: "forbidden" }
      : { allowed: false, reason: "authenticationRequired" };
  };
}

const accessGrantAdapters: AccessGrantAdapters = {
  exercise: {
    async findAccessLevel(userId, resourceId) {
      const grant = await ExerciseAccess.findOne({
        user: userId,
        exercise: resourceId,
      }).select("access");
      return grant?.access ?? null;
    },
  },
  tacticBoard: {
    async findAccessLevel(userId, resourceId) {
      const grant = await TacticboardAccess.findOne({
        user: userId,
        tacticboard: resourceId,
      }).select("access");
      return grant?.access ?? null;
    },
  },
  practicePlan: {
    async findAccessLevel(userId, resourceId) {
      const grant = await PracticePlanAccess.findOne({
        user: userId,
        practicePlan: resourceId,
      }).select("access");
      return grant?.access ?? null;
    },
  },
};

export const decideResourceAuthorization =
  createResourceAuthorization(accessGrantAdapters);
