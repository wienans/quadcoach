import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import TacticBoard from "../models/tacticBoard";
import mongoose from "mongoose";
import crypto from "crypto";
import Exercise from "../models/exercise";
import TacticBoardFavorite from "../models/tacticBoardFav";
import TacticBoardAccess from "../models/tacticBoardAccess";
import User from "../models/user";
import { logEvents } from "../middleware/logger";
import {
  getResourceAuthorization,
  requireResourceAuthorization,
  serializeResourceAuthorizationDecision,
} from "./helpers/requireResourceAuthorization";
import { authorizationResourceFor } from "../authorization/resourceAuthorization";
import {
  toLegacyTacticBoardAccessPersistence,
  toLegacyTacticBoardListResponse,
  toLegacyTacticBoardReferencePersistence,
} from "../compatibility/tacticBoardCompatibility";

interface UserInfo {
  id?: string;
  roles?: string[];
  name?: string;
}

interface RequestWithUser extends Request {
  UserInfo?: UserInfo;
}

function isMongoError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error;
}

// @desc    Get all Tactic Boards
// @route   GET /api/tacticboards
// @access  Public - Returns only public boards and user's private boards
export const getAllTacticBoards = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
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
      /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin|all)\b/g,
      (match) => `$${match}`,
    );
    // Convert comma-separated strings in $all operators to arrays
    queryString = queryString.replace(
      /"?\$all"?\s*:\s*"([^"]+)"/g,
      (_, match) =>
        `"$all": [${match.split(",").map((item: string) => `"${item}"`)}]`,
    );

    let parseObject = JSON.parse(queryString);

    parseObject.$or = [{ isPrivate: false }];

    if (req.UserInfo?.id) {
      parseObject.$or.push({ isPrivate: true, user: req.UserInfo.id });

      // Only query for access records if user is authenticated
      const tacticBoardAccessEntries = await TacticBoardAccess.find({
        user: req.UserInfo.id,
      });

      if (tacticBoardAccessEntries.length > 0) {
        parseObject.$or.push({
          _id: {
            $in: tacticBoardAccessEntries.map((tacticBoardAccess) =>
              tacticBoardAccess.tacticboard.toString(),
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

    const totalCount = await TacticBoard.countDocuments(parseObject);
    const tacticBoards = await TacticBoard.find(parseObject)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.send(
      toLegacyTacticBoardListResponse({
        tacticBoards,
        pagination: {
          total: totalCount,
          page,
          pages: Math.ceil(totalCount / limit),
        },
      }),
    );
  },
);

// @desc    Get all Tactic Board headers (minimal data)
// @route   GET /api/tacticboards/header
// @access  Public - Returns only public boards and user's private boards
export const getAllTacticBoardHeaders = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
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
      const tacticBoardAccessEntries = await TacticBoardAccess.find({
        user: req.UserInfo.id,
      });

      if (tacticBoardAccessEntries.length > 0) {
        parseObject.$or.push({
          _id: {
            $in: tacticBoardAccessEntries.map((tacticBoardAccess) =>
              tacticBoardAccess.tacticboard.toString(),
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

    const totalCount = await TacticBoard.countDocuments(parseObject);
    const tacticBoards = await TacticBoard.find(parseObject)
      .select("_id name tags isPrivate creator user")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.send(
      toLegacyTacticBoardListResponse({
        tacticBoards,
        pagination: {
          total: totalCount,
          page,
          pages: Math.ceil(totalCount / limit),
        },
      }),
    );
  },
);

// @desc    Get Tactic Board by ID
// @route   GET /api/tacticboards/:id
// @access  Public - Returns public board or user's private board
export const getById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (mongoose.isValidObjectId(tacticBoardId)) {
      const result = await TacticBoard.findOne({ _id: tacticBoardId });
      if (result) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.tacticBoard(tacticBoardId, result),
            "view",
          ))
        ) {
          return;
        }

        res.send(result);
      } else {
        res.status(404).json({ result: "No Record Found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  },
);

// @desc    Create new Tactic Board
// @route   POST /api/tacticboards
// @access  Private - Authenticated users only
export const createNewTacticBoard = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (req.UserInfo?.id) {
      const tacticBoard = new TacticBoard(req.body);
      const result = await tacticBoard.save();
      if (!result) {
        console.error("Couldn't create Tactic Board");
        res.send({ message: "Couldn't create Tactic Board" });
      } else {
        res.status(201).send({
          message: "Tactic Board created successfully",
          _id: result._id,
        });
      }
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  },
);

// @desc    Update entire Tactic Board by ID
// @route   PATCH /api/tacticboards/:id
// @access  Private - Owner or Admin only
export const updateById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (mongoose.isValidObjectId(tacticBoardId)) {
      const findResult = await TacticBoard.findOne({ _id: tacticBoardId });
      if (findResult) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.tacticBoard(tacticBoardId, findResult),
            "edit",
          ))
        ) {
          return;
        }

        const updates = { ...(req.body as Record<string, unknown>) };
        delete updates.user;
        delete updates.owner;

        const result = await TacticBoard.updateOne(
          { _id: tacticBoardId },
          { $set: updates },
        );
        if (result.modifiedCount > 0) {
          res.json({ message: "Tactic Board updated successfully" });
        } else {
          res.json({ message: "No changes made" });
        }
      } else {
        res.status(404).json({ message: "Tactic Board not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  },
);

// @desc    Update specific page in Tactic Board
// @route   PATCH /api/tacticboards/:id/:pageId
// @access  Private - Owner or Admin only
export const updatePageById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId, pageId } = req.params;
    if (
      mongoose.isValidObjectId(tacticBoardId) &&
      mongoose.isValidObjectId(pageId)
    ) {
      const findResult = await TacticBoard.findOne({ _id: tacticBoardId });
      if (findResult) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.tacticBoard(tacticBoardId, findResult),
            "edit",
          ))
        ) {
          return;
        }

        // Update specific page within the pages array
        const result = await TacticBoard.updateOne(
          { _id: tacticBoardId, "pages._id": pageId }, // Match TacticBoard and specific page
          {
            $set: {
              "pages.$[page]": req.body,
            },
          },
          {
            arrayFilters: [{ "page._id": pageId }], // Apply update to the matching page only
          },
        );
        if (result.modifiedCount > 0) {
          res.json({ message: "Page updated successfully" });
        } else {
          res.status(404).json({ message: "Page not found" });
        }
      } else {
        res.status(404).json({ message: "Tactic Board not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  },
);

// @desc    Update Tactic Board metadata only
// @route   PATCH /api/tacticboards/:id/meta
// @access  Private - Owner or Admin only
export const updateMetaById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;

    if (mongoose.isValidObjectId(tacticBoardId)) {
      const findResult = await TacticBoard.findOne({ _id: tacticBoardId });
      if (findResult) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.tacticBoard(tacticBoardId, findResult),
            "edit",
          ))
        ) {
          return;
        }

        // Destructure the fields to be updated from req.body, excluding `pages`
        const { name, isPrivate, tags, description, coaching_points } =
          req.body;
        if (isPrivate) {
          // Check if the Tactic Board is used in any exercises
          const exercisesUsingTacticBoard = await Exercise.find({
            description_blocks: {
              $elemMatch: {
                tactics_board: tacticBoardId,
              },
            },
          });
          if (exercisesUsingTacticBoard.length > 0) {
            res.status(400).json({
              message:
                "Cannot update Tactic Board to private - it is being used in exercises",
              exercises: exercisesUsingTacticBoard.map((ex) => ({
                id: ex._id,
                name: ex.name,
              })),
            });
            return;
          }
        }
        // Update the Tactic Board with the new fields
        const result = await TacticBoard.updateOne(
          { _id: tacticBoardId },
          {
            $set: {
              name,
              isPrivate,
              tags,
              description,
              coaching_points,
            },
          },
        );

        if (result.modifiedCount > 0) {
          res.json({ message: "Tactic Board updated successfully" });
        } else {
          res.status(404).json({ message: "No changes made" });
        }
      } else {
        res.status(404).json({ message: "Tactic Board not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  },
);

// @desc    Delete Tactic Board by ID
// @route   DELETE /api/tacticboards/:id
// @access  Private - Owner or Admin only
export const deleteById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (mongoose.isValidObjectId(tacticBoardId)) {
      const findResult = await TacticBoard.findOne({ _id: tacticBoardId });

      if (findResult) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.tacticBoard(tacticBoardId, findResult),
            "delete",
          ))
        ) {
          return;
        }

        // Check if the Tactic Board is used in any exercises
        const exercisesUsingTacticBoard = await Exercise.find({
          description_blocks: {
            $elemMatch: {
              tactics_board: tacticBoardId,
            },
          },
        });
        if (exercisesUsingTacticBoard.length > 0) {
          res.status(400).json({
            message:
              "Cannot delete Tactic Board - it is being used in exercises",
            exercises: exercisesUsingTacticBoard.map((ex) => ({
              id: ex._id,
              name: ex.name,
            })),
          });
          return;
        }

        // Delete Favorite Entries
        await TacticBoardFavorite.deleteMany({ tacticboard: tacticBoardId });
        await TacticBoardAccess.deleteMany({ tacticboard: tacticBoardId });
        // If not used in exercises, proceed with deletion
        const result = await TacticBoard.deleteOne({ _id: tacticBoardId });
        if (result.deletedCount > 0) {
          res.json({ message: "Tactic Board deleted successfully" });
        } else {
          res.status(404).json({ message: "Tactic Board not found" });
        }
      } else {
        res.status(404).json({ message: "No Record Found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  },
);

// @desc    Create new page in Tactic Board
// @route   POST /api/tacticboards/:id/newPage
// @access  Private - Owner or Admin only
export const createNewPage = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;

    if (mongoose.isValidObjectId(tacticBoardId)) {
      const findResult = await TacticBoard.findOne({ _id: tacticBoardId });
      if (findResult) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.tacticBoard(tacticBoardId, findResult),
            "edit",
          ))
        ) {
          return;
        }

        // Add new page to the pages array
        const result = await TacticBoard.findOneAndUpdate(
          { _id: tacticBoardId },
          { $push: { pages: req.body } },
        );

        if (result) {
          res.json({ message: "New page added successfully" });
        } else {
          res.status(404).json({ message: "Failed to add new page" });
        }
      } else {
        res.status(404).json({ message: "Tactic Board not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  },
);

// @desc    Insert page at specific position in Tactic Board
// @route   POST /api/tacticboards/:id/insertPage/:position
// @access  Private - Owner or Admin only
export const insertPageAtPosition = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId, position } = req.params;
    const insertPosition = parseInt(position);

    if (mongoose.isValidObjectId(tacticBoardId) && !isNaN(insertPosition)) {
      const findResult = await TacticBoard.findOne({ _id: tacticBoardId });
      if (findResult) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.tacticBoard(tacticBoardId, findResult),
            "edit",
          ))
        ) {
          return;
        }

        // Validate position is within bounds
        if (
          insertPosition < 0 ||
          insertPosition > (findResult.pages?.length || 0)
        ) {
          res.status(400).json({ message: "Invalid position" });
          return;
        }

        // Insert page at specific position using $push with $position
        const result = await TacticBoard.findOneAndUpdate(
          { _id: tacticBoardId },
          {
            $push: {
              pages: {
                $each: [req.body],
                $position: insertPosition,
              },
            },
          },
        );

        if (result) {
          res.json({ message: "Page inserted successfully" });
        } else {
          res.status(404).json({ message: "Failed to insert page" });
        }
      } else {
        res.status(404).json({ message: "Tactic Board not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format or position" });
    }
  },
);

// @desc    Delete page from Tactic Board
// @route   DELETE /api/tacticboards/:id/:pageId
// @access  Private - Owner or Admin only
export const deletePageById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId, pageId } = req.params;

    if (
      mongoose.isValidObjectId(tacticBoardId) &&
      mongoose.isValidObjectId(pageId)
    ) {
      const findResult = await TacticBoard.findOne({ _id: tacticBoardId });
      if (findResult) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.tacticBoard(tacticBoardId, findResult),
            "edit",
          ))
        ) {
          return;
        }

        const result = await TacticBoard.updateOne(
          { _id: tacticBoardId },
          { $pull: { pages: { _id: pageId } } },
        );

        if (result.modifiedCount > 0) {
          res.json({ message: "Page deleted successfully" });
        } else {
          res.status(404).json({ message: "Page not found" });
        }
      } else {
        res.status(404).json({ message: "Tactic Board not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  },
);

// @desc    Check if user has access to a Tactic Board
// @route   GET /api/tacticboards/:id/access
// @access  Private - Authenticated users only
export const checkAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.isValidObjectId(tacticBoardId)) {
      res.status(400).json({ message: "Invalid Tactic Board ID" });
      return;
    }

    const tacticBoard = await TacticBoard.findById(tacticBoardId);
    if (!tacticBoard) {
      res.status(404).json({ message: "Tactic Board not found" });
      return;
    }

    const decision = await getResourceAuthorization(
      req,
      authorizationResourceFor.tacticBoard(tacticBoardId, tacticBoard),
      "view",
    );
    res.json(serializeResourceAuthorizationDecision(decision));
  },
);

// @desc    Grant access to a Tactic Board for a user
// @route   POST /api/tacticboards/:id/access
// @access  Private - Users with access
export const setAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (!mongoose.isValidObjectId(tacticBoardId)) {
      res.status(400).json({ message: "Invalid Tactic Board ID" });
      return;
    }

    const tacticBoard = await TacticBoard.findById(tacticBoardId);
    if (!tacticBoard) {
      res.status(404).json({ message: "Tactic Board not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.tacticBoard(tacticBoardId, tacticBoard),
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
      const accessEntry = await TacticBoardAccess.findOneAndUpdate(
        toLegacyTacticBoardReferencePersistence({
          userId,
          tacticBoardId,
        }),
        toLegacyTacticBoardAccessPersistence({
          userId,
          tacticBoardId,
          access,
        }),
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

// @desc    Remove access to a Tactic Board for a user
// @route   DELETE /api/tacticboards/:id/access
// @access  Private - Users with access
export const deleteAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (!mongoose.isValidObjectId(tacticBoardId)) {
      res.status(400).json({ message: "Invalid Tactic Board ID" });
      return;
    }

    const tacticBoard = await TacticBoard.findById(tacticBoardId);
    if (!tacticBoard) {
      res.status(404).json({ message: "Tactic Board not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.tacticBoard(tacticBoardId, tacticBoard),
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

    const result = await TacticBoardAccess.deleteOne(
      toLegacyTacticBoardReferencePersistence({
        userId,
        tacticBoardId,
      }),
    );

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Access entry not found" });
      return;
    }

    res.json({ message: "Access removed successfully" });
  },
);

// @desc    Duplicate Tactic Board by ID
// @route   POST /api/tacticboards/:id/duplicate
// @access  Private - authenticated users with access to view the board
export const duplicateById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.isValidObjectId(tacticBoardId)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    const tacticBoard = await TacticBoard.findById(tacticBoardId);
    if (!tacticBoard) {
      res.status(404).json({ message: "Tactic Board not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.tacticBoard(tacticBoardId, tacticBoard),
        "view",
      ))
    ) {
      return;
    }

    const tacticBoardData = tacticBoard.toObject() as {
      isPrivate?: boolean;
      tags?: string[];
      pages?: unknown[];
      description?: string;
      coaching_points?: string;
    };

    const stripIds = (obj: unknown): unknown => {
      if (Array.isArray(obj)) {
        return obj.map(stripIds);
      }
      if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
          Object.entries(obj as Record<string, unknown>)
            .filter(([key]) => key !== "_id")
            .map(([key, value]) => [key, stripIds(value)]),
        );
      }
      return obj;
    };

    const duplicatedTacticBoard = new TacticBoard({
      name: `Copy of ${tacticBoard.name ?? "Tactic Board"}`,
      isPrivate: tacticBoardData.isPrivate,
      tags: tacticBoardData.tags,
      pages: stripIds(tacticBoardData.pages),
      description: tacticBoardData.description,
      coaching_points: tacticBoardData.coaching_points,
      creator: req.UserInfo.name ?? req.UserInfo.id,
      user: req.UserInfo.id,
    });

    const result = await duplicatedTacticBoard.save();

    res.status(201).json({
      message: "Tactic Board duplicated successfully",
      _id: result._id,
    });
  },
);

// @desc    Get all users who have access to a Tactic Board
// @route   GET /api/tacticboards/:id/access
// @access  Private - Users with access
export const getAllAccessUsers = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (!mongoose.isValidObjectId(tacticBoardId)) {
      res.status(400).json({ message: "Invalid Tactic Board ID" });
      return;
    }

    const tacticBoard = await TacticBoard.findById(tacticBoardId);
    if (!tacticBoard) {
      res.status(404).json({ message: "Tactic Board not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.tacticBoard(tacticBoardId, tacticBoard),
        "manageAccess",
      ))
    ) {
      return;
    }

    const accessEntries = await TacticBoardAccess.find({
      tacticboard: tacticBoardId,
    }).populate("user", "name");

    res.json(accessEntries);
  },
);

// @desc    Share Tactic Board with user by email
// @route   POST /api/tacticboards/:id/share
// @access  Private - Owner or Admin only
export const shareTacticBoard = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
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

    const tacticBoard = await TacticBoard.findById(tacticBoardId);
    if (!tacticBoard) {
      res.status(404).json({ message: "Tactic Board not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.tacticBoard(tacticBoardId, tacticBoard),
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

    const existingAccess = await TacticBoardAccess.findOne({
      tacticboard: tacticBoardId,
      user: targetUser._id,
    });

    if (existingAccess) {
      existingAccess.access = access;
      await existingAccess.save();
      res.json({ message: "Access updated successfully" });
    } else {
      const newAccess = new TacticBoardAccess({
        tacticboard: tacticBoardId,
        user: targetUser._id,
        access,
      });
      await newAccess.save();
      res.status(201).json({ message: "Access granted successfully" });
    }
  },
);

const isDuplicateShareTokenError = (error: unknown): boolean => {
  return isMongoError(error) && error.code === 11000;
};

const ensureShareTokenWithRetry = async (
  tacticBoard: InstanceType<typeof TacticBoard>,
  maxAttempts: number = 5,
): Promise<void> => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    tacticBoard.shareToken = crypto.randomUUID();

    try {
      await tacticBoard.save();
      return;
    } catch (error) {
      if (!isDuplicateShareTokenError(error)) {
        throw error;
      }
    }
  }

  throw new Error("Unable to generate unique share token");
};

// @desc    Create (or return existing) Share Link for a Tactic Board
// @route   POST /api/tacticboards/:id/share-link
// @access  Private - users with edit permission
export const createShareLink = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.isValidObjectId(tacticBoardId)) {
      res.status(400).json({ message: "Invalid Tactic Board ID" });
      return;
    }

    const tacticBoard = await TacticBoard.findById(tacticBoardId);
    if (!tacticBoard) {
      res.status(404).json({ message: "Tactic Board not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.tacticBoard(tacticBoardId, tacticBoard),
        "edit",
      ))
    ) {
      return;
    }
    try {
      if (!tacticBoard.shareToken) {
        await ensureShareTokenWithRetry(tacticBoard);
      }
      const publicBaseUrl =
        process.env.PUBLIC_BASE_URL || "https://quadcoach.app";
      res.status(201).json({
        message: "Share link available",
        token: tacticBoard.shareToken,
        shareLink: `${publicBaseUrl}/tacticboards/share/${tacticBoard.shareToken}`,
      });
    } catch (e: any) {
      logEvents(
        `Failed to create Share Link for Tactic Board ${tacticBoardId}: ${e.message}`,
        "error.log",
      );
      res.status(500).json({ message: "Failed to create share link" });
    }
  },
);

// @desc    Delete Share Link from a Tactic Board
// @route   DELETE /api/tacticboards/:id/share-link
// @access  Private - users with edit permission
export const deleteShareLink = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.isValidObjectId(tacticBoardId)) {
      res.status(400).json({ message: "Invalid Tactic Board ID" });
      return;
    }

    const tacticBoard = await TacticBoard.findById(tacticBoardId);
    if (!tacticBoard) {
      res.status(404).json({ message: "Tactic Board not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.tacticBoard(tacticBoardId, tacticBoard),
        "edit",
      ))
    ) {
      return;
    }

    tacticBoard.shareToken = undefined;
    await tacticBoard.save();

    res.json({ message: "Share link removed" });
  },
);

// @desc    Get Tactic Board by Share Link token (public)
// @route   GET /api/tacticboards/share/:token
// @access  Public
export const getByShareToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token || token.trim() === "") {
      res.status(400).json({ message: "Invalid share token" });
      return;
    }

    const tacticBoard = await TacticBoard.findOne({ shareToken: token });
    if (!tacticBoard) {
      res.status(404).json({ message: "Share link not found" });
      return;
    }

    res.json(tacticBoard);
  },
);
