// Practice Plan controller (implements T035–T040 + T054 access helper + T055 error util)
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { ISection, PracticePlan } from "../models/practicePlan";
import PracticePlanAccess from "../models/practicePlanAccess";
import {
  isNonEmptyName,
  validateNonNegativeDurations,
} from "./helpers/practicePlanValidation";
import User from "../models/user";

interface RequestWithUser extends Request {
  UserInfo?: {
    id: string;
    roles: string[];
  };
}
function isMongoError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error;
}

function sendValidation(res: Response, message: string, errors: string[]) {
  return res.status(400).json({ message, errors });
}

export const getPracticePlans = async (req: RequestWithUser, res: Response) => {
  try {
    let queryString: string = JSON.stringify(req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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
      /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin)\b/g,
      (match) => `$${match}`
    );
    let parseObject = JSON.parse(queryString);

    parseObject.$or = [{ isPrivate: false }];

    if (req.UserInfo?.id) {
      parseObject.$or.push({ isPrivate: true, user: req.UserInfo.id });

      // Only query for access records if user is authenticated
      const accessPracticePlans = await PracticePlanAccess.find({
        user: req.UserInfo.id,
      });

      if (accessPracticePlans.length > 0) {
        parseObject.$or.push({
          _id: {
            $in: accessPracticePlans.map((practicePlan) =>
              practicePlan.practicePlan.toString()
            ),
          },
        });
      }
    }

    if (
      req.UserInfo?.roles?.includes("Admin") ||
      req.UserInfo?.roles?.includes("admin")
    ) {
      parseObject.$or.push({ isPrivate: true });
    }

    // Create sort object
    const sortObj: { [key: string]: 1 | -1 } = {};
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Map frontend sort fields to database fields
    switch (sortBy) {
      case "name":
        sortObj.name = sortDirection;
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
    const total = await PracticePlan.countDocuments(parseObject);

    // Get practice plans with pagination
    const practicePlans = await PracticePlan.find(parseObject)
      .select("_id name description tags sections user createdAt updatedAt")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = Math.ceil(total / limit);

    return res.json({
      practiceplans: practicePlans,
      pagination: {
        page: page,
        limit: limit,
        total,
        pages,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ message: "Get failed", error: e.message });
  }
};

export const createPracticePlan = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { name, description, tags, sections } = req.body || {};
    if (!isNonEmptyName(name))
      return res.status(400).json({ message: "Name required" });

    const plan = await PracticePlan.create({
      name: name.trim(),
      description,
      tags: tags || [],
      sections,
      user: userId,
      isPrivate: false,
    });
    return res.status(201).json(plan);
  } catch (e: any) {
    return res.status(500).json({ message: "Create failed", error: e.message });
  }
};

export const getPracticePlan = async (req: RequestWithUser, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }
    const result = await PracticePlan.findOne({ _id: req.params.id });
    if (result) {
      // Check if the practice plan is private
      if (result.isPrivate && result.user) {
        const userId = req.UserInfo?.id;
        const isOwner = userId && userId !== "" && userId === result.user.toString();
        const isAdmin = req.UserInfo?.roles?.includes("Admin") || req.UserInfo?.roles?.includes("admin");
        
        // Check if user has shared access (only if user is authenticated)
        const hasSharedAccess = userId && userId !== ""
          ? await PracticePlanAccess.exists({
              user: userId,
              practicePlan: req.params.id,
            })
          : false;

        if (!isOwner && !isAdmin && !hasSharedAccess) {
          res.status(403).json({ message: "Forbidden" });
          return;
        }
      }

      res.send(result);
    } else {
      res.status(404).json({ result: "No Record Found" });
    }
  } catch (e: any) {
    return res.status(500).json({ message: "Get failed", error: e.message });
  }
};

export const patchPracticePlan = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    const findResult = await PracticePlan.findOne({ _id: req.params.id });
    if (findResult) {
      if (!req.UserInfo?.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const accessUser = await PracticePlanAccess.findOne({
        user: req.UserInfo.id,
        practicePlan: req.params.id,
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

      const updates: any = {};
      if (req.body.name !== undefined) {
        if (!isNonEmptyName(req.body.name))
          return res.status(400).json({ message: "Invalid name" });
        updates.name = req.body.name.trim();
      }
      if (req.body.description !== undefined)
        updates.description = req.body.description;
      if (req.body.tags !== undefined) updates.tags = req.body.tags;
      if (req.body.isPrivate !== undefined)
        updates.isPrivate = req.body.isPrivate;
      if (req.body.sections !== undefined) {
        const durationErrors = validateNonNegativeDurations(req.body);
        if (durationErrors.length)
          return sendValidation(
            res,
            "Duration validation failed",
            durationErrors
          );
        updates.sections = req.body.sections;
      }
      updates.updatedAt = new Date();
      const updated = await PracticePlan.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );
      return res.json(updated);
    } else {
      res.status(404).json({ message: "Practice Plan not found" });
    }
  } catch (e: any) {
    return res.status(500).json({ message: "Patch failed", error: e.message });
  }
};

export const deletePracticePlan = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    const findResult = await PracticePlan.findOne({ _id: req.params.id });

    if (findResult) {
      // Check permissions
      if (!req.UserInfo?.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const accessUser = await PracticePlanAccess.findOne({
        user: req.UserInfo.id,
        practicePlan: req.params.id,
      });
      const hasAccess =
        findResult.user?.toString() === req.UserInfo.id ||
        req.UserInfo.roles?.includes("Admin") ||
        req.UserInfo.roles?.includes("admin");

      if (!hasAccess) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      await PracticePlanAccess.deleteMany({ practicePlan: req.params.id });
      const result = await PracticePlan.deleteOne({ _id: req.params.id });
      if (result.deletedCount > 0) {
        res.json({ message: "Practice Plan deleted successfully" });
      } else {
        res.status(404).json({ message: "Practice Plan not found" });
      }
    } else {
      res.status(404).json({ message: "No Record Found" });
    }
  } catch (e: any) {
    return res.status(500).json({ message: "Delete failed", error: e.message });
  }
};

// @desc    Get all users who have access to a practice plan
// @route   GET /api/practice-plans/:id/access
// @access  Private - Users with access
export const getAllAccessUsers = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid practice plan ID" });
      return;
    }

    const practicePlan = await PracticePlan.findById(req.params.id);
    if (!practicePlan) {
      res.status(404).json({ message: "Practice Plan not found" });
      return;
    }

    // Check if user has access to view access list
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const hasAccess =
      practicePlan.user?.toString() === req.UserInfo.id ||
      req.UserInfo.roles?.includes("Admin") ||
      req.UserInfo.roles?.includes("admin") ||
      (await PracticePlanAccess.exists({
        user: req.UserInfo.id,
        practicePlan: req.params.id,
      }));

    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const accessEntries = await PracticePlanAccess.find({
      practicePlan: req.params.id,
    }).populate("user", "name");

    res.json(accessEntries);
  }
);

// @desc    Grant access to a practice plan for a user
// @route   POST /api/practice-plans/:id/access
// @access  Private - Users with access
export const setAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid practice plan ID" });
      return;
    }

    const practicePlan = await PracticePlan.findById(req.params.id);
    if (!practicePlan) {
      res.status(404).json({ message: "Practice Plan not found" });
      return;
    }

    // Check if user is the creator/owner or admin (only they can grant access)
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const isCreator =
      practicePlan.user?.toString() === req.UserInfo.id ||
      req.UserInfo.roles?.includes("Admin") ||
      req.UserInfo.roles?.includes("admin");

    if (!isCreator) {
      res
        .status(403)
        .json({ message: "Only the creator can modify access settings" });
      return;
    }

    const { userId, access } = req.body;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      res.status(400).json({ message: "Invalid user ID provided" });
      return;
    }

    if (!access || !["view", "edit"].includes(access)) {
      res
        .status(400)
        .json({ message: "Invalid access level. Must be 'view' or 'edit'" });
      return;
    }

    try {
      const accessEntry = await PracticePlanAccess.findOneAndUpdate(
        { user: userId, practicePlan: req.params.id },
        { user: userId, practicePlan: req.params.id, access },
        { upsert: true, new: true }
      );
      res.status(201).json(accessEntry);
    } catch (error) {
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

// @desc    Remove access to a practice plan for a user
// @route   DELETE /api/practice-plans/:id/access
// @access  Private - Users with access
export const deleteAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid practice plan ID" });
      return;
    }

    const practicePlan = await PracticePlan.findById(req.params.id);
    if (!practicePlan) {
      res.status(404).json({ message: "Practice Plan not found" });
      return;
    }

    // Check if user is the creator/owner or admin (only they can remove access)
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const isCreator =
      practicePlan.user?.toString() === req.UserInfo.id ||
      req.UserInfo.roles?.includes("Admin") ||
      req.UserInfo.roles?.includes("admin");

    if (!isCreator) {
      res
        .status(403)
        .json({ message: "Only the creator can modify access settings" });
      return;
    }

    const { userId } = req.body;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      res.status(400).json({ message: "Invalid user ID provided" });
      return;
    }

    const result = await PracticePlanAccess.deleteOne({
      user: userId,
      practicePlan: req.params.id,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Access entry not found" });
      return;
    }

    res.json({ message: "Access removed successfully" });
  }
);

// @desc    Share practice plan with user by email
// @route   POST /api/practice-plans/:id/share
// @access  Private - Owner or Admin only
export const sharePracticePlan = asyncHandler(
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

    if (!["view", "edit"].includes(access)) {
      res.status(400).json({ message: "Access must be 'view' or 'edit'" });
      return;
    }

    const practicePlan = await PracticePlan.findById(req.params.id);
    if (!practicePlan) {
      res.status(404).json({ message: "Practice Plan not found" });
      return;
    }

    const isOwner = practicePlan.user?.toString() === req.UserInfo.id;
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

    const existingAccess = await PracticePlanAccess.findOne({
      practicePlan: req.params.id,
      user: targetUser._id,
    });

    if (existingAccess) {
      existingAccess.access = access;
      await existingAccess.save();
      res.json({ message: "Access updated successfully" });
    } else {
      const newAccess = new PracticePlanAccess({
        practicePlan: req.params.id,
        user: targetUser._id,
        access,
      });
      await newAccess.save();
      res.status(201).json({ message: "Access granted successfully" });
    }
  }
);
