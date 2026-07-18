// Practice Plan controller (implements T035–T040 + T054 access helper + T055 error util)
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { PracticePlan } from "../models/practicePlan";
import PracticePlanAccess from "../models/practicePlanAccess";
import {
  isNonEmptyName,
  validateNonNegativeDurations,
} from "./helpers/practicePlanValidation";
import { allowlistedRequestFields } from "./helpers/allowlistedRequestFields";
import User from "../models/user";
import {
  getResourceAuthorization,
  requireResourceAuthorization,
  serializeResourceAuthorizationDecision,
} from "./helpers/requireResourceAuthorization";
import { authorizationResourceFor } from "../authorization/resourceAuthorization";
import {
  manageShareLink,
  publishShareLink,
  resolveShareLink,
} from "../shareLinks/shareLinkHttp";
import { parsePracticePlanPublishMetadata } from "./helpers/publishMetadata";

interface RequestWithUser extends Request {
  UserInfo?: {
    id: string;
    roles: string[];
  };
}

const PRACTICE_PLAN_CREATE_FIELDS = [
  "name",
  "description",
  "tags",
  "sections",
] as const;

const PRACTICE_PLAN_UPDATE_FIELDS = [
  ...PRACTICE_PLAN_CREATE_FIELDS,
  "isPrivate",
] as const;

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
      (match) => `$${match}`,
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
              practicePlan.practicePlan.toString(),
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
      .select(
        "_id name description tags sections user isPrivate createdAt updatedAt",
      )
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
  res: Response,
) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const fields = allowlistedRequestFields(
      req.body,
      PRACTICE_PLAN_CREATE_FIELDS,
    );
    if (!isNonEmptyName(fields.name))
      return res.status(400).json({ message: "Name required" });

    fields.name = fields.name.trim();
    fields.tags = fields.tags || [];
    const plan = await PracticePlan.create({
      ...fields,
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
    const result = await PracticePlan.findOne({ _id: req.params.id }).select(
      "-shareToken",
    );
    if (result) {
      if (
        !(await requireResourceAuthorization(
          req,
          res,
          authorizationResourceFor.practicePlan(req.params.id, result),
          "view",
        ))
      ) {
        return;
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
  res: Response,
) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    const findResult = await PracticePlan.findOne({ _id: req.params.id });
    if (findResult) {
      if (
        !(await requireResourceAuthorization(
          req,
          res,
          authorizationResourceFor.practicePlan(req.params.id, findResult),
          "edit",
        ))
      ) {
        return;
      }

      const requestUpdates = allowlistedRequestFields(
        req.body,
        PRACTICE_PLAN_UPDATE_FIELDS,
      );
      const updates: Record<string, unknown> = {};
      if (requestUpdates.name !== undefined) {
        if (!isNonEmptyName(requestUpdates.name))
          return res.status(400).json({ message: "Invalid name" });
        updates.name = requestUpdates.name.trim();
      }
      if (requestUpdates.description !== undefined)
        updates.description = requestUpdates.description;
      if (requestUpdates.tags !== undefined) updates.tags = requestUpdates.tags;
      if (requestUpdates.isPrivate !== undefined)
        if (typeof requestUpdates.isPrivate !== "boolean") {
          return res.status(400).json({ message: "Invalid privacy value" });
        } else {
          updates.isPrivate = requestUpdates.isPrivate;
        }
      if (requestUpdates.sections !== undefined) {
        const durationErrors = validateNonNegativeDurations(requestUpdates);
        if (durationErrors.length)
          return sendValidation(
            res,
            "Duration validation failed",
            durationErrors,
          );
        updates.sections = requestUpdates.sections;
      }
      updates.updatedAt = new Date();
      if (updates.isPrivate === false) {
        const publishUpdates = parsePracticePlanPublishMetadata(updates);
        if (!publishUpdates) {
          return res
            .status(400)
            .json({ message: "Invalid Practice Plan content" });
        }
        const published = await publishShareLink(
          req,
          res,
          "practicePlan",
          req.params.id,
          publishUpdates,
        );
        if (!published) return;
        const publishedPlan = await PracticePlan.findById(req.params.id).select(
          "-shareToken",
        );
        return res.json(publishedPlan);
      }
      const updated = await PracticePlan.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true },
      ).select("-shareToken");
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
  res: Response,
) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    const findResult = await PracticePlan.findOne({ _id: req.params.id });

    if (findResult) {
      if (
        !(await requireResourceAuthorization(
          req,
          res,
          authorizationResourceFor.practicePlan(req.params.id, findResult),
          "delete",
        ))
      ) {
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

export const checkAccess = asyncHandler(
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

    const decision = await getResourceAuthorization(
      req,
      authorizationResourceFor.practicePlan(req.params.id, practicePlan),
      "view",
    );

    res.json(serializeResourceAuthorizationDecision(decision));
  },
);

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

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.practicePlan(req.params.id, practicePlan),
        "manageAccess",
      ))
    ) {
      return;
    }

    const accessEntries = await PracticePlanAccess.find({
      practicePlan: req.params.id,
    }).populate("user", "name");

    res.json(accessEntries);
  },
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

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.practicePlan(req.params.id, practicePlan),
        "manageAccess",
      ))
    ) {
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
        { upsert: true, new: true },
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
  },
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

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.practicePlan(req.params.id, practicePlan),
        "manageAccess",
      ))
    ) {
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
  },
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

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.practicePlan(req.params.id, practicePlan),
        "manageAccess",
      ))
    ) {
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
  },
);

export const getShareLink = asyncHandler(
  async (req: RequestWithUser, res: Response) =>
    manageShareLink(req, res, "practicePlan", { type: "status" }),
);

// @desc    Create (or return existing) share link for a practice plan
// @route   POST /api/practice-plans/:id/share-link
// @access  Private - users with edit permission
export const createShareLink = asyncHandler(
  async (req: RequestWithUser, res: Response) =>
    manageShareLink(req, res, "practicePlan", { type: "ensure" }),
);

export const rotateShareLink = asyncHandler(
  async (req: RequestWithUser, res: Response) =>
    manageShareLink(req, res, "practicePlan", { type: "rotate" }),
);

// @desc    Delete share link from a practice plan
// @route   DELETE /api/practice-plans/:id/share-link
// @access  Private - users with edit permission
export const deleteShareLink = asyncHandler(
  async (req: RequestWithUser, res: Response) =>
    manageShareLink(req, res, "practicePlan", { type: "revoke" }),
);

// @desc    Get practice plan by share token (public)
// @route   GET /api/practice-plans/share/:token
// @access  Public
export const getByShareToken = asyncHandler(
  async (req: Request, res: Response) =>
    resolveShareLink(req, res, "practicePlan"),
);
