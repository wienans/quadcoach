import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import TacticBoard from "../models/tacticboard";
import mongoose from "mongoose";

// @route GET
// @access public
export const getAllTacticboards = asyncHandler(
  async (req: Request, res: Response) => {
    let queryString: string = JSON.stringify(req.query);

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin)\b/g,
      (match) => `$${match}`
    );

    const exercises = await TacticBoard.find(JSON.parse(queryString));

    res.send(exercises);
  }
);

// @route GET
// @access public
export const getById = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const result = await TacticBoard.findOne({ _id: req.params.id });
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
// @access public
export const createNewTacticboard = asyncHandler(
  async (req: Request, res: Response) => {
    let tacticboard = new TacticBoard(req.body);
    const result = await tacticboard.save();
    if (!result) {
      console.error("Couldn't create Tacticboard");
    }
    res.send(result);
  }
);

// @route PATCH
// @access Private
export const updateById = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const result = await TacticBoard.updateOne(
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
    const result = await TacticBoard.deleteOne({ _id: req.params.id });
    if (result) {
      res.send(result);
    } else {
      res.send({ result: "No Record Found" });
    }
  } else {
    res.send({ result: "No Record Found" });
  }
});
