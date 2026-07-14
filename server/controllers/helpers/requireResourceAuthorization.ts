import { Request, Response } from "express";
import {
  decideResourceAuthorization,
  ResourceAction,
  ResourceAuthorizationDecision,
  ResourceAuthorizationResource,
} from "../../authorization/resourceAuthorization";

interface RequestWithUser extends Request {
  UserInfo?: {
    id?: string;
    roles?: string[];
  };
}

export const getResourceAuthorization = async (
  req: RequestWithUser,
  resource: ResourceAuthorizationResource,
  action: ResourceAction,
): Promise<ResourceAuthorizationDecision> =>
  decideResourceAuthorization({
    action,
    actor: req.UserInfo?.id
      ? { id: req.UserInfo.id, roles: req.UserInfo.roles ?? [] }
      : undefined,
    resource,
  });

export const serializeResourceAuthorizationDecision = (
  decision: ResourceAuthorizationDecision,
) => ({
  hasAccess: decision.allowed,
  type: decision.allowed ? decision.basis : null,
  level:
    decision.allowed && decision.basis === "granted"
      ? decision.accessLevel
      : decision.allowed &&
          (decision.basis === "owner" || decision.basis === "admin")
        ? "edit"
        : null,
});

export const requireResourceAuthorization = async (
  req: RequestWithUser,
  res: Response,
  resource: ResourceAuthorizationResource,
  action: ResourceAction,
): Promise<boolean> => {
  const decision = await getResourceAuthorization(req, resource, action);
  if (decision.allowed) {
    return true;
  }

  const status =
    decision.reason === "authenticationRequired" ? 401 : 403;
  res.status(status).json({
    message: status === 401 ? "Unauthorized" : "Forbidden",
  });
  return false;
};
