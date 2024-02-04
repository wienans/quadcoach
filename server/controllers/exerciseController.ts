import User from "../models/user";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import TacticBoard from "../models/tacticboard";
import Exercise from "../models/exercise";
import mongoose from "mongoose";
// @desc Get all users
// @route GET /users
// @access Private
export const getAllExercises = asyncHandler(
  async (req: Request, res: Response) => {
    let queryString: string = JSON.stringify(req.query);

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin)\b/g,
      (match) => `$${match}`
    );

    const exercises = await Exercise.find(JSON.parse(queryString));

    res.send(exercises);
  }
);

// @desc Get users by ID
// @route GET /users
// @access Private
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

// @desc Create new user
// @route POST /users
// @access Private
export const createNewExercise = asyncHandler(
  async (req: Request, res: Response) => {
    let exercise = new Exercise(req.body);
    const result = await exercise.save();
    if (!result) {
      console.error("Couldn't create Exercise");
    }
    res.send(result);
  }
);

// @desc Update a user
// @route PATCH /users
// @access Private
export const updateById = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const result = await Exercise.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.send(result);
  } else {
    res.send({ result: "No Record Found" });
  }
});

// @desc Delete a user
// @route DELETE /users
// @access Private
export const deleteById = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const result = await Exercise.deleteOne({ _id: req.params.id });
    if (result) {
      res.send(result);
    } else {
      res.send({ result: "No Record Found" });
    }
  } else {
    res.send({ result: "No Record Found" });
  }
});

// @desc Delete a user
// @route DELETE /users
// @access Private
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
