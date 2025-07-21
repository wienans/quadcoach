import { Request, Response, NextFunction } from 'express';

interface UserInfo {
  username: string;
  roles: string[];
}

interface AuthenticatedRequest extends Request {
  UserInfo?: UserInfo;
}

export const verifyAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.UserInfo?.roles?.some(role => role.toLowerCase() === "admin")) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
};