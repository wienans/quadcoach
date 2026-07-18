import {
  decideResourceAuthorization,
  ResourceAuthorizationDecision,
  ResourceAuthorizationRequest,
} from "../authorization/resourceAuthorization";
import { ShareLinkManagementAuthority } from "./shareLinks";

export type ResourceAuthorizationDecider = (
  request: ResourceAuthorizationRequest,
) => Promise<ResourceAuthorizationDecision>;

export const createShareLinkManagementAuthority = (
  decide: ResourceAuthorizationDecider = decideResourceAuthorization,
): ShareLinkManagementAuthority => ({
  decide: ({ actor, resource }) =>
    decide({
      action: "edit",
      actor: actor ? { id: actor.id, roles: [...actor.roles] } : undefined,
      resource: {
        type: resource.kind,
        id: resource.id,
        ownerId: resource.ownerId,
        isPrivate: resource.isPrivate,
      },
    }),
});

export const shareLinkManagementAuthority =
  createShareLinkManagementAuthority();
