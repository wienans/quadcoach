import User from "../models/user";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import TacticBoard from "../models/tacticBoard";
import Exercise from "../models/exercise";
import mongoose from "mongoose";
import ExerciseFav from "../models/exerciseFav";
import TacticBoardFavorite from "../models/tacticBoardFav";
import ExerciseAccess from "../models/exerciseAccess";
import TacticBoardAccess from "../models/tacticBoardAccess";

interface UserInfo {
  id?: string;
  roles?: string[];
}

interface RequestWithUser extends Request {
  UserInfo?: UserInfo;
}

type AccessLevel = "view" | "edit";

type CardSummaryDocument = Record<string, unknown>;

interface ExerciseCardSummary {
  _id: string;
  name: string;
  tags: string[];
  creator?: string;
  user?: string;
  createdAt?: Date;
  updatedAt?: Date;
  materials: string[];
  durationMinutes: number | null;
  persons: number | null;
  beaters: number | null;
  chasers: number | null;
  relatedTo: string[];
}

interface TacticBoardCardSummary {
  _id: string;
  name: string;
  tags: string[];
  isPrivate: boolean;
  creator?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AccessibleRelationship<Summary> {
  item: Summary;
  accessLevel: AccessLevel;
}

const USER_SUMMARIES_UNAVAILABLE = "User summaries unavailable";

// Account summaries are allowlisted: passwords, verification/reset tokens,
// session activity, and any unintended nested fields must never leave.
const userAccountSummarySelect = "_id name email roles active";

const exerciseSummarySelect =
  "_id name tags creator user createdAt updatedAt materials time_min persons beaters chasers related_to";

const tacticBoardSummarySelect =
  "_id name tags isPrivate creator createdAt updatedAt";

function textArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function idString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function optionalDate(value: unknown): Date | undefined {
  return value instanceof Date ? value : undefined;
}

function optionalMetric(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function relatedToIds(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function toExerciseCardSummary(
  document: CardSummaryDocument,
): ExerciseCardSummary {
  return {
    _id: idString(document._id) ?? "",
    name: optionalString(document.name) ?? "",
    tags: textArray(document.tags),
    creator: optionalString(document.creator),
    user: idString(document.user),
    createdAt: optionalDate(document.createdAt),
    updatedAt: optionalDate(document.updatedAt),
    materials: textArray(document.materials),
    durationMinutes: optionalMetric(document.time_min),
    persons: optionalMetric(document.persons),
    beaters: optionalMetric(document.beaters),
    chasers: optionalMetric(document.chasers),
    relatedTo: relatedToIds(document.related_to),
  };
}

function toTacticBoardCardSummary(
  document: CardSummaryDocument,
): TacticBoardCardSummary {
  return {
    _id: idString(document._id) ?? "",
    name: optionalString(document.name) ?? "",
    tags: textArray(document.tags),
    isPrivate: document.isPrivate === true,
    creator: optionalString(document.creator),
    createdAt: optionalDate(document.createdAt),
    updatedAt: optionalDate(document.updatedAt),
  };
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private - Admin only
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const users = await User.find().select(userAccountSummarySelect).lean();
    if (!users?.length) {
      res.status(400).json({ message: "No users found" });
    } else {
      res.json(users);
    }
  } catch {
    res.status(500).json({ message: USER_SUMMARIES_UNAVAILABLE });
  }
});

// @desc    Get online users count
// @route   GET /api/user/online-count
// @access  Private - Admin only
export const getOnlineUsersCount = asyncHandler(
  async (req: Request, res: Response) => {
    // Consider users online if they were active within the last 15 minutes (matching JWT expiration)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const onlineUsersCount = await User.countDocuments({
      lastActivity: { $gte: fifteenMinutesAgo },
      active: true,
    });

    res.json({ onlineUsersCount });
  },
);

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
  },
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
  },
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
  },
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
    // const tacticBoard = await TacticBoard.findOne({ user: id }).lean().exec();
    // const exercises = await Exercise.findOne({ user: id }).lean().exec();
    // if (tacticBoard || exercises) {
    //   res
    //     .status(400)
    //     .json({ message: "User has assigned Exercises or Tactic Boards" });
    //   return;
    // }
    const user = await User.findById(id).exec();
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    await ExerciseFav.deleteMany({ user: id }).exec();
    await TacticBoardFavorite.deleteMany({ user: id }).exec();
    await user.deleteOne();
    const reply = `Username ${user.email} with ID ${user._id} deleted`;
    res.json({ message: reply });
  },
);

// @desc    Get user's owned and accessible exercises
// @route   GET /api/user/:id/exercises
// @access  Private - User themselves or Admin
export const getUserExercises = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    if (
      (!req.UserInfo?.id || req.UserInfo.id !== req.params.id) &&
      !req.UserInfo?.roles?.some((role) => role.toLowerCase() === "admin")
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    try {
      const [ownedDocuments, accessEntries] = await Promise.all([
        Exercise.find({ user: req.params.id })
          .select(exerciseSummarySelect)
          .lean(),
        ExerciseAccess.find({ user: req.params.id })
          .populate({ path: "exercise", select: exerciseSummarySelect })
          .lean(),
      ]);

      res.json({
        owned: (ownedDocuments as unknown as CardSummaryDocument[]).map(
          toExerciseCardSummary,
        ),
        accessible: accessEntries.flatMap(
          (entry): AccessibleRelationship<ExerciseCardSummary>[] => {
            const document =
              entry.exercise as unknown as CardSummaryDocument | null;
            if (document === null || document === undefined) return [];
            return [
              {
                item: toExerciseCardSummary(document),
                accessLevel: entry.access,
              },
            ];
          },
        ),
      });
    } catch {
      res.status(500).json({ message: USER_SUMMARIES_UNAVAILABLE });
    }
  },
);

// @desc    Get user's owned and accessible Tactic Boards
// @route   GET /api/user/:id/tacticboards
// @access  Private - User themselves or Admin
export const getUserTacticBoards = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    if (
      (!req.UserInfo?.id || req.UserInfo.id !== req.params.id) &&
      !req.UserInfo?.roles?.some((role) => role.toLowerCase() === "admin")
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    try {
      const [ownedDocuments, accessEntries] = await Promise.all([
        TacticBoard.find({ user: req.params.id })
          .select(tacticBoardSummarySelect)
          .lean(),
        TacticBoardAccess.find({ user: req.params.id })
          .populate({ path: "tacticboard", select: tacticBoardSummarySelect })
          .lean(),
      ]);

      res.json({
        owned: (ownedDocuments as unknown as CardSummaryDocument[]).map(
          toTacticBoardCardSummary,
        ),
        accessible: accessEntries.flatMap(
          (entry): AccessibleRelationship<TacticBoardCardSummary>[] => {
            const document =
              entry.tacticboard as unknown as CardSummaryDocument | null;
            if (document === null || document === undefined) return [];
            return [
              {
                item: toTacticBoardCardSummary(document),
                accessLevel: entry.access,
              },
            ];
          },
        ),
      });
    } catch {
      res.status(500).json({ message: USER_SUMMARIES_UNAVAILABLE });
    }
  },
);
