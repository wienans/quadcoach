import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken";
import { logEvents } from "./logger";

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string);

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (
    process.env.ACCESS_TOKEN_SECRET === undefined ||
    process.env.REFRESH_TOKEN_SECRET === undefined
  ) {
    logEvents(`JWT SECRETS NOT DEFINED`, "errLog.log");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // @ts-ignore
    req.UserInfo = {};
    // @ts-ignore
    req.UserInfo.email = decoded.UserInfo.email;
    // @ts-ignore
    req.UserInfo.roles = decoded.UserInfo.roles;
    // @ts-ignore
    req.UserInfo.name = decoded.UserInfo.name;
    // @ts-ignore
    req.UserInfo.id = decoded.UserInfo.id;

    next();
  } catch (e) {
    // @ts-ignore
    req.UserInfo = {};
    // @ts-ignore
    req.UserInfo.email = "";
    // @ts-ignore
    req.UserInfo.roles = [];
    // @ts-ignore
    req.UserInfo.name = "";
    // @ts-ignore
    req.UserInfo.id = "";
    next();
  }
};

export default verifyJWT;
