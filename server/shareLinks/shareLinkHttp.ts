import { ErrorRequestHandler, Request, Response } from "express";
import { logEvents } from "../middleware/logger";
import { createProductionShareLinks } from "./productionShareLinks";
import { ProductionShareLinkResourceTypes } from "./mongoShareLinkAdapters";
import {
  ShareLinkCommand,
  ShareLinkError,
  ShareLinkResourceKind,
} from "./shareLinks";

interface ShareLinkRequest extends Request {
  UserInfo?: {
    id?: string;
    roles?: string[];
  };
}

const shareLinks = createProductionShareLinks();

const statusByErrorCode: Record<ShareLinkError["code"], number> = {
  invalidResourceId: 400,
  authenticationRequired: 401,
  forbidden: 403,
  resourceNotFound: 404,
  privateResourceRequired: 409,
  shareLinkInactive: 409,
  shareLinkConflict: 409,
  shareLinkNotFound: 404,
  tokenGenerationExhausted: 500,
};

const actorFrom = (req: ShareLinkRequest) =>
  req.UserInfo?.id
    ? { id: req.UserInfo.id, roles: req.UserInfo.roles ?? [] }
    : undefined;

export const sendShareLinkError = (
  res: Response,
  error: unknown,
  context: string,
): void => {
  if (error instanceof ShareLinkError) {
    const status = statusByErrorCode[error.code];
    if (status < 500) {
      res.status(status).json({ message: error.message });
      return;
    }
  }

  logEvents(`Share Link operation failed (${context})`, "error.log");
  res.status(500).json({ message: "Share Link operation failed" });
};

export const manageShareLink = async (
  req: ShareLinkRequest,
  res: Response,
  kind: ShareLinkResourceKind,
  command: ShareLinkCommand<never>,
): Promise<void> => {
  try {
    const result = await shareLinks.manage({
      actor: actorFrom(req),
      resource: { kind, id: req.params.id },
      command,
    });

    if (result.state === "inactive") {
      res.status(200).json({ status: "inactive" });
      return;
    }
    if (result.outcome === "status") {
      res.status(200).json({ status: "active", shareLink: result.url });
      return;
    }
    res.status(result.outcome === "created" ? 201 : 200).json({
      status: result.outcome,
      shareLink: result.url,
    });
  } catch (error) {
    sendShareLinkError(res, error, `${kind}:${command.type}`);
  }
};

export const publishShareLink = async <Kind extends ShareLinkResourceKind>(
  req: ShareLinkRequest,
  res: Response,
  kind: Kind,
  id: string,
  validatedMetadata: ProductionShareLinkResourceTypes[Kind]["publishMetadata"],
): Promise<boolean> => {
  try {
    await shareLinks.manage({
      actor: actorFrom(req),
      resource: { kind, id },
      command: {
        type: "publish",
        validatedMetadata,
      },
    });
    return true;
  } catch (error) {
    sendShareLinkError(res, error, `${kind}:publish`);
    return false;
  }
};

export const resolveShareLink = async (
  req: Request,
  res: Response,
  kind: ShareLinkResourceKind,
): Promise<void> => {
  try {
    res.status(200).json(await shareLinks.resolve(kind, req.params.token));
  } catch (error) {
    if (error instanceof ShareLinkError && error.code === "shareLinkNotFound") {
      res.status(404).json({ message: "Share link not found" });
      return;
    }
    logEvents(`Share Link resolution failed (${kind})`, "error.log");
    res.status(500).json({ message: "Share Link operation failed" });
  }
};

export const malformedShareTokenPath: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
) => {
  if (error instanceof URIError && /^\/share\//.test(req.url)) {
    res.status(404).json({ message: "Share link not found" });
    return;
  }
  next(error);
};
