import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Exercise from "../models/exercise";
import mongoose from "mongoose";
import ExerciseFav from "../models/exerciseFav";

interface RequestWithUser extends Request {
  UserInfo?: {
    id: string;
    roles: string[];
  };
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

    // Remove pagination params from the query string
    const queryObj = JSON.parse(queryString);
    delete queryObj.page;
    delete queryObj.limit;
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

    // Get total count for pagination
    const total = await Exercise.countDocuments(query);

    // Execute query with pagination
    const exercises = await Exercise.find(query).skip(skip).limit(limit);

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
        if (
          findResult.user &&
          (!req.UserInfo?.id ||
            req.UserInfo.id != findResult.user?.toString()) &&
          !req.UserInfo?.roles?.includes("Admin") &&
          !req.UserInfo?.roles?.includes("admin")
        ) {
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
        if (
          findResult.user &&
          (!req.UserInfo?.id ||
            req.UserInfo.id != findResult.user?.toString()) &&
          !req.UserInfo?.roles?.includes("Admin") &&
          !req.UserInfo?.roles?.includes("admin")
        ) {
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
