import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import { logEvents } from "./logger";

interface AccessTokenUserInfo {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

type AuthenticationRequest = Request & {
  UserInfo?: AccessTokenUserInfo;
  [accessTokenVerified]?: true;
};

const accessTokenVerified = Symbol("accessTokenVerified");

const anonymousUserInfo = (): AccessTokenUserInfo => ({
  email: "",
  roles: [],
  name: "",
  id: "",
});

const userInfoFrom = (decoded: string | JwtPayload): AccessTokenUserInfo => {
  if (typeof decoded === "string" || typeof decoded.UserInfo !== "object") {
    throw new jwt.JsonWebTokenError("Invalid access token payload");
  }

  const userInfo = decoded.UserInfo as Partial<AccessTokenUserInfo>;
  if (
    typeof userInfo.id !== "string" ||
    userInfo.id.length === 0 ||
    typeof userInfo.email !== "string" ||
    typeof userInfo.name !== "string" ||
    !Array.isArray(userInfo.roles) ||
    !userInfo.roles.every((role) => typeof role === "string")
  ) {
    throw new jwt.JsonWebTokenError("Invalid access token payload");
  }

  return {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    roles: userInfo.roles,
  };
};

const recordActivity = (userId: string) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  User.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { lastActivity: { $lt: fiveMinutesAgo } },
        { lastActivity: { $exists: false } },
      ],
    },
    { lastActivity: new Date() },
  ).catch(() => {
    // Activity tracking must not break an otherwise valid request.
  });
};

export const createAccessTokenMiddleware = (
  optional: boolean,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authRequest = req as AuthenticationRequest;
    if (authRequest[accessTokenVerified]) {
      next();
      return;
    }

    const authorization = req.get("authorization");
    if (authorization === undefined) {
      if (optional) {
        authRequest.UserInfo = anonymousUserInfo();
        next();
        return;
      }

      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const match = /^Bearer ([^\s]+)$/.exec(authorization);
    if (!match) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (process.env.ACCESS_TOKEN_SECRET === undefined) {
      logEvents("JWT ACCESS TOKEN SECRET NOT DEFINED", "errLog.log");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const decoded = jwt.verify(match[1], process.env.ACCESS_TOKEN_SECRET);
      const userInfo = userInfoFrom(decoded);
      authRequest.UserInfo = userInfo;
      authRequest[accessTokenVerified] = true;
      recordActivity(userInfo.id);
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: "Token expired" });
        return;
      }

      res.status(401).json({ message: "Unauthorized" });
    }
  };
};
