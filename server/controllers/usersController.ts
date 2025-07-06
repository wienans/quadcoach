import User from "../models/user";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import TacticBoard from "../models/tacticboard";
import Exercise from "../models/exercise";
import mongoose from "mongoose";
import ExerciseFav from "../models/exerciseFav";
import TacticboardFav from "../models/tacticboardFav";

interface UserInfo {
  id?: string;
  roles?: string[];
}

interface RequestWithUser extends Request {
  UserInfo?: UserInfo;
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private - Admin only
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  let queryString: string = JSON.stringify(req.query);

  queryString = queryString.replace(
    /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin)\b/g,
    (match) => `$${match}`
  );

  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    res.status(400).json({ message: "No users found" });
  } else {
    res.json(users);
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private - Admin or User themselves
export const getUserById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      if (
        (!req.UserInfo?.id || req.UserInfo.id !== req.params.id) &&
        !req.UserInfo?.roles?.some((role) => role.toLowerCase() === "admin")
      ) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      const users = await User.findOne({
        _id: req.params.id,
      })
        .select("-password")
        .lean();
      if (!users) {
        res.status(400).json({ message: "User Not found" });
      } else {
        res.json(users);
      }
    }
  }
);

// @desc    Create new user
// @route   POST /api/users
// @access  Private - Admin only
export const createNewUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, roles } = req.body;

    // Confirm data
    if (
      !name ||
      !email ||
      !password ||
      !Array.isArray(roles) ||
      !roles.length
    ) {
      res.status(400).json({ message: "All fields are required" });
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
      roles,
    };
    const user = await User.create(userObject);
    if (user) {
      res.status(201).json({ message: `New user ${email} created` });
    } else {
      res.status(400).json({ message: "Invalid user data received" });
    }
  }
);

// @desc    Update user details
// @route   PATCH /api/users
// @access  Private - Admin only
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, email, roles, active, password } = req.body;
  // Confirm data
  if (
    !id ||
    !name ||
    !email ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    res
      .status(400)
      .json({ message: "All fields except password are required" });
    return;
  }

  const user = await User.findById(id).exec();
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }

  //Check for duplicate
  const duplicate = await User.findOne({ email }).lean().exec();
  if (duplicate && duplicate._id.toString() !== id) {
    res.status(409).json({ message: "Duplicate email" });
    return;
  }
  user.name = name;
  user.email = email;
  user.roles = roles;
  user.active = active;
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  const updatedUser = await user.save();
  res.json({ message: `${updatedUser.email} updated` });
});

// @desc    Get user by email
// @route   GET /api/users/email/:email
// @access  Private - Authenticated users only
export const getUserByEmail = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { email } = req.params;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select("_id name email")
      .lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  }
);

// @desc    Delete user account
// @route   DELETE /api/users
// @access  Private - Admin only
export const deleteUser = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id } = req.body;
    if (
      (!req.UserInfo?.id || req.UserInfo.id !== id) &&
      !req.UserInfo?.roles?.some((role) => role.toLowerCase() === "admin")
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    if (!id) {
      res.status(400).json({ message: "User ID Required" });
      return;
    }
    // const boards = await TacticBoard.findOne({ user: id }).lean().exec();
    // const exercises = await Exercise.findOne({ user: id }).lean().exec();
    // if (boards || exercises) {
    //   res
    //     .status(400)
    //     .json({ message: "User has assigned Exercises or Tacticboards" });
    //   return;
    // }
    const user = await User.findById(id).exec();
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    await ExerciseFav.deleteMany({ user: id }).exec();
    await TacticboardFav.deleteMany({ user: id }).exec();
    const result = await user.deleteOne();
    const reply = `Username ${result.email} with ID ${result._id} deleted`;
    res.json({ message: reply });
  }
);
