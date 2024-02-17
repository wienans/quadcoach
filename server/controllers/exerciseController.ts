import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Exercise from "../models/exercise";
import mongoose from "mongoose";

// @route GET
// @access public
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

// @route GET
// @access Public
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

// @route POST
// @access Public
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

// @route PATCH
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

// @route DELETE
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

// @route GET
// @access Public
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
