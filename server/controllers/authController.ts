import bcrypt from "bcrypt";
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user";
import { logEvents } from "../middleware/logger";
import validator from "validator";
import crypto from "crypto";

// @desc Login
// @route POST /auth
// @access Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser || !foundUser.active) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (
    process.env.ACCESS_TOKEN_SECRET === undefined ||
    process.env.REFRESH_TOKEN_SECRET === undefined
  ) {
    logEvents(`JWT SECRETS NOT DEFINED`, "errLog.log");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { email: foundUser.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "none", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing email and roles
  res.json({ accessToken });
});

// @desc Register
// @route POST /auth/register
// @access Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).json({ message: "Invalid email" });
    return;
  }
  // Check for duplicate email in the db
  const duplicate = await User.findOne({ email }).lean().exec();
  if (duplicate) {
    res.status(409).json({ message: "Duplicate e-mail" });
    return;
  }

  // Hash password, with 10 salt rounds
  const hashedPwd = await bcrypt.hash(password, 10);
  const userObject = {
    name,
    email,
    password: hashedPwd,
    emailToken: crypto.randomBytes(64).toString("hex"),
  };
  const user = await User.create(userObject);
  if (user) {
    res.status(201).json({ message: `New user ${email} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
export const refresh = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      console.log("No cookies found");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const refreshToken = cookies.jwt;
    if (
      process.env.ACCESS_TOKEN_SECRET === undefined ||
      process.env.REFRESH_TOKEN_SECRET === undefined
    ) {
      logEvents(`JWT SECRETS NOT DEFINED`, "errLog.log");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const foundUser = await User.findOne({
        // @ts-ignore
        email: decode?.email,
      }).exec();

      if (!foundUser) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    } catch (e) {
      if (e) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
    }
  }
);

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
export const logout = (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.sendStatus(204); //No content
    return;
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.json({ message: "Cookie cleared" });
};

// @desc Verify Email
// @route POST /auth/verifyEmail
// @access Public
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const emailToken = req.body.emailToken;

  if (!emailToken) {
    res.status(400).json({ message: "Email Token Required" });
    return;
  }
  const user = await User.findOne({ emailToken, isVerified: false });
  if (!user) {
    res
      .status(404)
      .json({ message: "Invalid Email Token, or already verified" });
    return;
  }
  user.isVerified = true;
  user.emailToken = "";
  await user.save();
  res.status(200).json({ message: "Email Verified" });
});
