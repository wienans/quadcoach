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
    req.email = decoded.email;
    // @ts-ignore
    req.roles = decoded.roles;
    // @ts-ignore
    req.name = decoded.name;
    // @ts-ignore
    req.id = decoded.id;
    next();
  } catch (e) {
    if (e) return res.status(403).json({ message: "Forbidden" });
  }
};

export default verifyJWT;
