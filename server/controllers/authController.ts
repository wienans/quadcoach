import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user";
import { logEvents } from "../middleware/logger";
import validator from "validator";
import crypto from "crypto";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

// @desc    Authenticate user and get tokens
// @route   POST /auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser || !foundUser.active || !foundUser.isVerified) {
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

// @desc    Request password reset email
// @route   POST /auth/resetPassword
// @access  Public - Anyone can request password reset
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (
      process.env.ACCESS_TOKEN_SECRET === undefined ||
      process.env.REFRESH_TOKEN_SECRET === undefined
    ) {
      logEvents(`JWT SECRETS NOT DEFINED`, "errLog.log");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!email) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const token = jwt.sign(
      { email: foundUser.email, id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    foundUser.passwordResetToken = token;
    await foundUser.save();
    const source = fs.readFileSync(
      path.join(__dirname, "../templates/resetPassword.html"),
      "utf-8"
    );
    const template = handlebars.compile(source);
    const replacements = {
      name: foundUser.name,
      passwordToken: token,
    };
    const htmlToSend = template(replacements);
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    transporter
      .sendMail({
        to: foundUser.email,
        from: process.env.EMAIL_USER,
        subject: "Reset Password",
        html: htmlToSend,
      })
      .then(() => {})
      .catch((error) => {
        logEvents(
          `Sending Reset Password E-Mail failed:` + error,
          "errLog.log"
        );
      });
    res.status(200).json({ message: "Password reset link sent" });
  }
);

// @desc    Update password using reset token
// @route   POST /auth/updatePassword
// @access  Public - Must have valid reset token
export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { password, passwordResetToken } = req.body;
    if (
      process.env.ACCESS_TOKEN_SECRET === undefined ||
      process.env.REFRESH_TOKEN_SECRET === undefined
    ) {
      logEvents(`JWT SECRETS NOT DEFINED`, "errLog.log");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const decode = jwt.verify(
        passwordResetToken,
        process.env.ACCESS_TOKEN_SECRET
      ) as JwtPayload;
      const foundUser = await User.findOne({
        email: decode.email,
      }).exec();
      if (!foundUser) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const hashedPwd = await bcrypt.hash(password, 10);
      foundUser.password = hashedPwd;
      foundUser.passwordResetToken = "";
      await foundUser.save();
      res.status(200).json({ message: "Password updated" });
    } catch (e) {
      if (e) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
    }
  }
);

// @desc    Register new user account
// @route   POST /auth/register
// @access  Public - Anyone can register
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

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const source = fs.readFileSync(
    path.join(__dirname, "../templates/verifyEmail.html"),
    "utf8"
  );
  const template = handlebars.compile(source);
  const replacements = {
    name: userObject.name,
    emailToken: userObject.emailToken,
  };
  const htmlToSend = template(replacements);
  transporter
    .sendMail({
      to: userObject.email,
      from: process.env.EMAIL_USER,
      subject: "Verify Email",
      html: htmlToSend,
    })
    .then(() => {})
    .catch((error) => {
      logEvents(`Sending Register E-Mail failed:` + error, "errLog.log");
    });
  const user = await User.create(userObject);
  if (user) {
    res.status(201).json({ message: `New user ${email} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc    Get new access token using refresh token
// @route   GET /auth/refresh
// @access  Public - Uses httpOnly refresh token cookie
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
      const decode = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ) as JwtPayload;
      const foundUser = await User.findOne({
        email: decode.email,
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

// @desc    Clear refresh token cookie
// @route   POST /auth/logout
// @access  Public - No auth needed to logout
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

// @desc    Verify user's email address
// @route   POST /auth/verifyEmail
// @access  Public - Uses email verification token
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
