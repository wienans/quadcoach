import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Exercise from "../models/exercise";
import mongoose from "mongoose";
import ExerciseFav from "../models/exerciseFav";
import ExerciseAccess from "../models/exerciseAccess";
import User from "../models/user";

interface RequestWithUser extends Request {
  UserInfo?: {
    id: string;
    roles: string[];
  };
}

// Add this type guard function at the top of the file, after the imports
function isMongoError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error;
}

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Public
export const getAllExercises = asyncHandler(
  async (req: Request, res: Response) => {
    let queryString: string = JSON.stringify(req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || "name";
    const sortOrder = (req.query.sortOrder as string) || "asc";

    // Remove pagination and sorting params from the query string
    const queryObj = JSON.parse(queryString);
    delete queryObj.page;
    delete queryObj.limit;
    delete queryObj.sortBy;
    delete queryObj.sortOrder;
    queryString = JSON.stringify(queryObj);

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin|all)\b/g,
      (match) => `$${match}`
    );

    queryString = queryString.replace(
      /"?\$all"?\s*:\s*"([^"]+)"/g,
      (_, match) =>
        `"$all": [${match.split(",").map((item: string) => `"${item}"`)}]`
    );

    const query = JSON.parse(queryString);

    // Create sort object
    const sortObj: { [key: string]: 1 | -1 } = {};
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Map frontend sort fields to database fields
    switch (sortBy) {
      case "name":
        sortObj.name = sortDirection;
        break;
      case "time":
        sortObj.time_min = sortDirection;
        break;
      case "persons":
        sortObj.persons = sortDirection;
        break;
      case "created":
        sortObj.createdAt = sortDirection;
        break;
      case "updated":
        sortObj.updatedAt = sortDirection;
        break;
      default:
        sortObj.name = 1; // Default sort by name ascending
    }

    sortObj._id = 1; // Always add _id as a secondary sort to ensure consistent ordering

    // Get total count for pagination
    const total = await Exercise.countDocuments(query);

    // Execute query with pagination and sorting
    const exercises = await Exercise.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.send({
      exercises,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }
);

// @desc    Get exercise by ID
// @route   GET /api/exercises/:id
// @access  Public
export const getById = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const result = await Exercise.findOne({ _id: req.params.id });
    if (result) {
      res.send(result);
    } else {
      res.send({ result: "No Record Found" });
    }
  } else {
    res.send({ result: "No Record Found" });
  }
});

// @desc    Create new exercise
// @route   POST /api/exercises
// @access  Private - Authenticated users only
export const createNewExercise = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (req.UserInfo?.id) {
      let exercise = new Exercise(req.body);
      const result = await exercise.save();
      if (!result) {
        console.error("Couldn't create Exercise");
      }
      res.status(201).send(result);
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  }
);

// @desc    Update exercise by ID
// @route   PATCH /api/exercises/:id
// @access  Private - Owner or Admin only
export const updateById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      const findResult = await Exercise.findOne({ _id: req.params.id });
      if (findResult) {
        if (!req.UserInfo?.id) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }

        const accessUser = await ExerciseAccess.findOne({
          user: req.UserInfo.id,
          exercise: req.params.id,
        });
        const hasAccess =
          findResult.user?.toString() === req.UserInfo.id ||
          req.UserInfo.roles?.includes("Admin") ||
          req.UserInfo.roles?.includes("admin") ||
          (accessUser && accessUser.access == "edit");
        if (!hasAccess) {
          res.status(403).json({ message: "Forbidden" });
          return;
        }

        const result = await Exercise.updateOne(
          { _id: req.params.id },
          { $set: req.body }
        );
        res.send(result);
      } else {
        res.send({ result: "No Record Found" });
      }
    } else {
      res.send({ result: "No Record Found" });
    }
  }
);

// @desc    Delete exercise by ID
// @route   DELETE /api/exercises/:id
// @access  Private - Owner or Admin only
export const deleteById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      const findResult = await Exercise.findOne({ _id: req.params.id });
      if (findResult) {
        if (!req.UserInfo?.id) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        const accessUser = await ExerciseAccess.findOne({
          user: req.UserInfo.id,
          exercise: req.params.id,
        });
        const hasAccess =
          findResult.user?.toString() === req.UserInfo.id ||
          req.UserInfo.roles?.includes("Admin") ||
          req.UserInfo.roles?.includes("admin") ||
          (accessUser && accessUser.access == "edit");

        if (!hasAccess) {
          res.status(403).json({ message: "Forbidden" });
          return;
        }

        // Delete Favorite Entries
        await ExerciseFav.deleteMany({ exercise: req.params.id });

        const result = await Exercise.deleteOne({ _id: req.params.id });
        res.send(result);
      } else {
        res.send({ result: "No Record Found" });
      }
    } else {
      res.send({ result: "No Record Found" });
    }
  }
);

// @desc    Get related exercises by ID
// @route   GET /api/exercises/:id/related
// @access  Public
export const getRelatedById = asyncHandler(
  async (req: Request, res: Response) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      const exerciseToGetRealted = await Exercise.findOne({
        _id: req.params.id,
      }).exec();
      if (!exerciseToGetRealted) {
        res.send({ result: "No Record Found" });
        return;
      }

      if (
        !exerciseToGetRealted.related_to ||
        exerciseToGetRealted.related_to.length === 0
      ) {
        res.send([]);
        return;
      }

      const result = await Exercise.find({
        $or: exerciseToGetRealted.related_to.map((r) => ({ _id: r._id })),
      });
      if (result) {
        res.send(result);
      } else {
        res.send({ result: "No Record Found" });
      }
    } else {
      res.send({ result: "No Record Found" });
    }
  }
);

// @desc    Grant access to an exercise for a user
// @route   POST /api/exercises/:id/access
// @access  Private - Users with access
export const setAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid exercise ID" });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    // Check if user has access to grant access
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const hasAccess =
      exercise.user?.toString() === req.UserInfo.id ||
      req.UserInfo.roles?.includes("Admin") ||
      req.UserInfo.roles?.includes("admin") ||
      (await ExerciseAccess.exists({
        user: req.UserInfo.id,
        exercise: req.params.id,
      }));

    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { userId, access } = req.body;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      res.status(400).json({ message: "Invalid user ID provided" });
      return;
    }

    if (access !== "edit") {
      res.status(400).json({
        message:
          "Access level must be 'edit' (view access is public for all exercises)",
      });
      return;
    }

    try {
      const accessEntry = await ExerciseAccess.create({
        user: userId,
        exercise: req.params.id,
        access,
      });
      res.status(201).json(accessEntry);
    } catch (error) {
      // Handle duplicate access grants
      if (isMongoError(error) && error.code === 11000) {
        res
          .status(400)
          .json({ message: "Access already granted to this user" });
        return;
      }
      throw error;
    }
  }
);

// @desc    Remove access to an exercise for a user
// @route   DELETE /api/exercises/:id/access
// @access  Private - Users with access
export const deleteAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid exercise ID" });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    // Check if user has access to remove access
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const hasAccess =
      exercise.user?.toString() === req.UserInfo.id ||
      req.UserInfo.roles?.includes("Admin") ||
      req.UserInfo.roles?.includes("admin") ||
      (await ExerciseAccess.exists({
        user: req.UserInfo.id,
        exercise: req.params.id,
      }));

    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { userId } = req.body;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      res.status(400).json({ message: "Invalid user ID provided" });
      return;
    }

    const result = await ExerciseAccess.deleteOne({
      user: userId,
      exercise: req.params.id,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Access entry not found" });
      return;
    }

    res.json({ message: "Access removed successfully" });
  }
);

// @desc    Check if user has access to an exercise
// @route   GET /api/exercises/:id/access
// @access  Private - Authenticated users only
export const checkAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid exercise ID" });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    // Check if user is the owner
    if (exercise.user?.toString() === req.UserInfo.id) {
      res.json({ hasAccess: true, type: "owner" });
      return;
    }

    // Check if user is an admin
    if (
      req.UserInfo.roles?.includes("Admin") ||
      req.UserInfo.roles?.includes("admin")
    ) {
      res.json({ hasAccess: true, type: "admin" });
      return;
    }

    // Check if user has been granted access
    const accessEntry = await ExerciseAccess.findOne({
      user: req.UserInfo.id,
      exercise: req.params.id,
    });

    if (accessEntry) {
      res.json({ hasAccess: true, type: "granted" });
      return;
    }

    res.json({ hasAccess: false, type: null });

    // Check if user has been granted access
    const access = await ExerciseAccess.findOne({
      user: req.UserInfo.id,
      exercise: req.params.id,
    });

    res.json({
      hasAccess: !!access,
      type: access ? "granted" : null,
    });
  }
);

// @desc    Get all users who have access to an exercise
// @route   GET /api/exercises/:id/access
// @access  Private - Owner or Admin only
export const getAllAccessUsers = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid exercise ID" });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }
    // Check if user has access
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const hasAccess =
      exercise.user?.toString() === req.UserInfo.id ||
      req.UserInfo.roles?.includes("Admin") ||
      req.UserInfo.roles?.includes("admin") ||
      (await ExerciseAccess.exists({
        user: req.UserInfo.id,
        exercise: req.params.id,
      }));

    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const accessEntries = await ExerciseAccess.find({
      exercise: req.params.id,
    }).populate("user", "name");

    res.json(accessEntries);
  }
);

// @desc    Share exercise with user by email
// @route   POST /api/exercises/:id/share
// @access  Private - Owner or Admin only
export const shareExercise = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { email, access } = req.body;
    if (!email || !access) {
      res.status(400).json({ message: "Email and access level are required" });
      return;
    }

    if (access !== "edit") {
      res.status(400).json({
        message:
          "Access must be 'edit' (view access is public for all exercises)",
      });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    const isOwner = exercise.user?.toString() === req.UserInfo.id;
    const isAdmin = req.UserInfo.roles?.some(
      (role) => role.toLowerCase() === "admin"
    );

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const targetUser = await User.findOne({
      email: email.toLowerCase(),
    }).select("_id");
    if (!targetUser) {
      res.status(404).json({ message: "User not found with this email" });
      return;
    }

    const existingAccess = await ExerciseAccess.findOne({
      exercise: req.params.id,
      user: targetUser._id,
    });

    if (existingAccess) {
      existingAccess.access = access;
      await existingAccess.save();
      res.json({ message: "Access updated successfully" });
    } else {
      const newAccess = new ExerciseAccess({
        exercise: req.params.id,
        user: targetUser._id,
        access,
      });
      await newAccess.save();
      res.status(201).json({ message: "Access granted successfully" });
    }
  }
);
