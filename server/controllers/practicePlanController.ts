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
interface AccessContext {
  plan: any | null;
  isOwner: boolean;
  hasEdit: boolean;
  hasAnyAccess: boolean;
}

function isMongoError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error;
}

async function loadAccessContext(
  planId: string,
  userId: string
): Promise<AccessContext> {
  const plan = await PracticePlan.findById(planId);
  if (!plan)
    return { plan: null, isOwner: false, hasEdit: false, hasAnyAccess: false };
  const isOwner = plan.user.toString() === userId;
  if (isOwner)
    return { plan, isOwner: true, hasEdit: true, hasAnyAccess: true };
  const access = await PracticePlanAccess.findOne({
    practicePlan: plan._id,
    user: userId,
  });
  if (!access)
    return { plan, isOwner: false, hasEdit: false, hasAnyAccess: false };
  return {
    plan,
    isOwner: false,
    hasEdit: access.access === "edit",
    hasAnyAccess: true,
  };
}

function sendValidation(res: Response, message: string, errors: string[]) {
  return res.status(400).json({ message, errors });
}

export const getPracticePlans = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

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
    }

    const accessPracticePlans = await PracticePlanAccess.find({
      user: req.UserInfo?.id,
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
    });
    return res.status(201).json(plan);
  } catch (e: any) {
    return res.status(500).json({ message: "Create failed", error: e.message });
  }
};

export const getPracticePlan = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = req.params.id;
    const ctx = await loadAccessContext(id, userId);
    if (!ctx.plan || !ctx.hasAnyAccess)
      return res.status(404).json({ message: "Not found" });
    return res.json(ctx.plan);
  } catch (e: any) {
    return res.status(500).json({ message: "Get failed", error: e.message });
  }
};

export const patchPracticePlan = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = req.params.id;
    const ctx = await loadAccessContext(id, userId);
    if (!ctx.plan || !(ctx.isOwner || ctx.hasEdit))
      return res.status(404).json({ message: "Not found" });

    const updates: any = {};
    if (req.body.name !== undefined) {
      if (!isNonEmptyName(req.body.name))
        return res.status(400).json({ message: "Invalid name" });
      updates.name = req.body.name.trim();
    }
    if (req.body.description !== undefined)
      updates.description = req.body.description;
    if (req.body.tags !== undefined) updates.tags = req.body.tags;
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
      ctx.plan._id,
      updates,
      { new: true }
    );
    return res.json(updated);
  } catch (e: any) {
    return res.status(500).json({ message: "Patch failed", error: e.message });
  }
};

export const deletePracticePlan = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = req.params.id;
    const ctx = await loadAccessContext(id, userId);
    if (!ctx.plan || !ctx.isOwner)
      return res.status(404).json({ message: "Not found" });
    await PracticePlan.deleteOne({ _id: ctx.plan._id });
    await PracticePlanAccess.deleteMany({ practicePlan: ctx.plan._id });
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ message: "Delete failed", error: e.message });
  }
};

// @desc    Get all users who have access to a tacticboard
// @route   GET /api/tacticboards/:id/access
// @access  Private - Users with access
export const getAllAccessUsers = async (
  req: RequestWithUser,
  res: Response
) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid Practice Plan ID" });
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
};

export const addAccess = asyncHandler(
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

export const removeAccess = async (req: RequestWithUser, res: Response) => {
  try {
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
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: "Remove access failed", error: e.message });
  }
};

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
