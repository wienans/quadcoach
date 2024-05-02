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
    let parseObject = JSON.parse(queryString);

    parseObject.$or = [{ isPrivate: false }];
    //@ts-ignore
    if (req.UserInfo.id) {
      //@ts-ignore
      parseObject.$or.push({ isPrivate: true, user: req.UserInfo.id });
    }
    //@ts-ignore
    if (
      //@ts-ignore
      req.UserInfo.roles.includes("Admin") ||
      //@ts-ignore
      req.UserInfo.roles.includes("admin")
    ) {
      //@ts-ignore
      parseObject.$or.push({ isPrivate: true });
    }

    const boards = await TacticBoard.find(parseObject);

    res.send(boards);
  }
);

// @route GET
// @access public
export const getById = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const result = await TacticBoard.findOne({ _id: req.params.id });

    if (result) {
      if (
        result.isPrivate &&
        result.user &&
        // @ts-ignore
        (!req.UserInfo.id || req.UserInfo.id != result.user?.toString()) &&
        // @ts-ignore
        !req.UserInfo.roles.includes("Admin") &&
        // @ts-ignore
        !req.UserInfo.roles.includes("admin")
      ) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      res.send(result);
    } else {
      res.status(404).json({ result: "No Record Found" });
    }
  } else {
    res.status(404).json({ result: "No Record Found" });
  }
});

// @route POST
// @access public
export const createNewTacticboard = asyncHandler(
  async (req: Request, res: Response) => {
    // @ts-ignore
    if (req.UserInfo.id != "") {
      let tacticboard = new TacticBoard(req.body);
      const result = await tacticboard.save();
      if (!result) {
        console.error("Couldn't create Tacticboard");
      }
      res.send(result);
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  }
);

// @route PATCH
// @access Private
export const updateById = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const findResult = await TacticBoard.findOne({ _id: req.params.id });
    if (findResult) {
      console.log(findResult.user);
      if (
        findResult.user &&
        // @ts-ignore
        (!req.UserInfo.id || req.UserInfo.id != findResult.user?.toString()) &&
        // @ts-ignore
        !req.UserInfo.roles.includes("Admin") &&
        // @ts-ignore
        !req.UserInfo.roles.includes("admin")
      ) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      const result = await TacticBoard.updateOne(
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
});

// @route DELETE
// @access Private
export const deleteById = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    const findResult = await TacticBoard.findOne({ _id: req.params.id });
    if (findResult) {
      if (
        findResult.user &&
        // @ts-ignore
        (!req.UserInfo.id || req.UserInfo.id != findResult.user?.toString()) &&
        // @ts-ignore
        !req.UserInfo.roles.includes("Admin") &&
        // @ts-ignore
        !req.UserInfo.roles.includes("admin")
      ) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      const result = await TacticBoard.deleteOne({ _id: req.params.id });
      res.send(result);
    } else {
      res.send({ result: "No Record Found" });
    }
  } else {
    res.send({ result: "No Record Found" });
  }
});
