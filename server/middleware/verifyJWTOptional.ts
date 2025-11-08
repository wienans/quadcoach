import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { logEvents } from "./logger";
import User from "../models/user";

/**
 * Optional JWT verification middleware
 * Unlike verifyJWT, this middleware does not block requests when no token is present
 * It sets UserInfo to empty values if no valid token exists
 * This allows controllers to implement public/private access patterns
 */
const verifyJWTOptional = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string);

  // If no auth header, set empty UserInfo and continue
  if (!authHeader?.startsWith("Bearer ")) {
    // @ts-ignore
    req.UserInfo = {
      email: "",
      roles: [],
      name: "",
      id: "",
    };
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  if (
    process.env.ACCESS_TOKEN_SECRET === undefined ||
    process.env.REFRESH_TOKEN_SECRET === undefined
  ) {
    logEvents(`JWT SECRETS NOT DEFINED`, "errLog.log");
    // @ts-ignore
    req.UserInfo = {
      email: "",
      roles: [],
      name: "",
      id: "",
    };
    next();
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    ) as JwtPayload;

    // Check if token is expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTimestamp) {
      // Token expired, set empty UserInfo and continue
      // @ts-ignore
      req.UserInfo = {
        email: "",
        roles: [],
        name: "",
        id: "",
      };
      next();
      return;
    }

    // Valid token, set UserInfo
    // @ts-ignore
    req.UserInfo = {
      email: decoded.UserInfo.email,
      roles: decoded.UserInfo.roles,
      name: decoded.UserInfo.name,
      id: decoded.UserInfo.id,
    };

    // Update user's last activity timestamp
    if (decoded.UserInfo.id) {
      User.findByIdAndUpdate(decoded.UserInfo.id, {
        lastActivity: new Date(),
      }).catch(() => {
        // Silently ignore errors to not break auth flow
      });
    }

    next();
  } catch (e) {
    // Invalid token, set empty UserInfo and continue
    // @ts-ignore
    req.UserInfo = {
      email: "",
      roles: [],
      name: "",
      id: "",
    };
    next();
  }
};

export default verifyJWTOptional;
