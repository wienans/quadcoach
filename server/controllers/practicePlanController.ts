import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import PracticePlan from "../models/practicePlan";
import mongoose from "mongoose";

interface RequestWithUser extends Request {
  UserInfo?: {
    id: string;
    roles: string[];
  };
}

// Add this type guard function
function isMongoError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error;
}

// @desc    Get all practice plans
// @route   GET /api/practice-plans
// @access  Public
export const getAllPracticePlans = asyncHandler(
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

    // Build sort object
    const sortObj: { [key: string]: 1 | -1 } = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    const practicePlans = await PracticePlan.find(query)
      .populate({
        path: "sections.playerGroups.exerciseBlocks.exerciseId",
        select: "name description_blocks",
      })
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await PracticePlan.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      practicePlans,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  }
);

// @desc    Get single practice plan
// @route   GET /api/practice-plans/:id
// @access  Public
export const getPracticePlan = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Not valid ObjectId");
    }

    const practicePlan = await PracticePlan.findById(id)
      .populate({
        path: "sections.playerGroups.exerciseBlocks.exerciseId",
        select: "name description_blocks",
      })
      .exec();

    if (practicePlan) {
      res.json(practicePlan);
    } else {
      res.status(404);
      throw new Error("Practice plan not found");
    }
  }
);

// @desc    Create new practice plan
// @route   POST /api/practice-plans
// @access  Private
export const createPracticePlan = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { name, description, tags, sections } = req.body;

    if (!name) {
      res.status(400);
      throw new Error("Practice plan name is required");
    }

    // Create default sections if none provided
    const defaultSections = [
      {
        name: "Warm Up",
        order: 0,
        playerGroups: [
          { name: "Chasers", order: 0, exerciseBlocks: [] },
          { name: "Beaters", order: 1, exerciseBlocks: [] },
        ],
      },
      {
        name: "Main",
        order: 1,
        playerGroups: [
          { name: "Chasers", order: 0, exerciseBlocks: [] },
          { name: "Beaters", order: 1, exerciseBlocks: [] },
        ],
      },
      {
        name: "Cooldown",
        order: 2,
        playerGroups: [
          { name: "Chasers", order: 0, exerciseBlocks: [] },
          { name: "Beaters", order: 1, exerciseBlocks: [] },
        ],
      },
    ];

    const practicePlan = await PracticePlan.create({
      name,
      description,
      tags,
      sections: sections || defaultSections,
      creator: req.UserInfo?.id,
      user: req.UserInfo?.id,
    });

    const populatedPracticePlan = await PracticePlan.findById(practicePlan._id)
      .populate({
        path: "sections.playerGroups.exerciseBlocks.exerciseId",
        select: "name description_blocks",
      })
      .exec();

    res.status(201).json(populatedPracticePlan);
  }
);

// @desc    Update practice plan
// @route   PUT /api/practice-plans/:id
// @access  Private
export const updatePracticePlan = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const { name, description, tags, sections } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Not valid ObjectId");
    }

    const practicePlan = await PracticePlan.findById(id);

    if (!practicePlan) {
      res.status(404);
      throw new Error("Practice plan not found");
    }

    try {
      const updatedPracticePlan = await PracticePlan.findByIdAndUpdate(
        id,
        {
          name,
          description,
          tags,
          sections,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate({
          path: "sections.playerGroups.exerciseBlocks.exerciseId",
          select: "name description_blocks",
        })
        .exec();

      res.json(updatedPracticePlan);
    } catch (error) {
      if (isMongoError(error) && error.code === 11000) {
        res.status(409);
        throw new Error("Practice plan name already exists");
      }
      throw error;
    }
  }
);

// @desc    Delete practice plan
// @route   DELETE /api/practice-plans/:id
// @access  Private
export const deletePracticePlan = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Not valid ObjectId");
    }

    const practicePlan = await PracticePlan.findById(id);

    if (!practicePlan) {
      res.status(404);
      throw new Error("Practice plan not found");
    }

    await PracticePlan.findByIdAndDelete(id);

    res.json({ message: "Practice plan deleted successfully" });
  }
);