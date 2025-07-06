import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import TacticBoard from "../models/tacticboard";
import mongoose from "mongoose";
import Exercise from "../models/exercise";
import TacticboardFav from "../models/tacticboardFav";
import TacticboardAccess from "../models/tacticboardAccess";

interface UserInfo {
  id?: string;
  roles?: string[];
}

interface RequestWithUser extends Request {
  UserInfo?: UserInfo;
}

function isMongoError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error;
}

// @desc    Get all tacticboards
// @route   GET /api/tacticboards
// @access  Public - Returns only public boards and user's private boards
export const getAllTacticboards = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    let queryString: string = JSON.stringify(req.query);

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin|all)\b/g,
      (match) => `$${match}`
    );
    // Convert comma-separated strings in $all operators to arrays
    queryString = queryString.replace(
      /"?\$all"?\s*:\s*"([^"]+)"/g,
      (_, match) =>
        `"$all": [${match.split(",").map((item: string) => `"${item}"`)}]`
    );

    let parseObject = JSON.parse(queryString);

    // Extract pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Remove pagination params from query object
    delete parseObject.page;
    delete parseObject.limit;

    parseObject.$or = [{ isPrivate: false }];

    if (req.UserInfo?.id) {
      parseObject.$or.push({ isPrivate: true, user: req.UserInfo.id });
    }

    const accessTacticboards = await TacticboardAccess.find({
      user: req.UserInfo?.id,
    });

    if (accessTacticboards.length > 0) {
      parseObject.$or.push({
        _id: {
          $in: accessTacticboards.map((tacticboard) =>
            tacticboard.tacticboard.toString()
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

    const totalCount = await TacticBoard.countDocuments(parseObject);
    const boards = await TacticBoard.find(parseObject).skip(skip).limit(limit);

    res.send({
      tacticboards: boards,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
      },
    });
  }
);

// @desc    Get all tacticboard headers (minimal data)
// @route   GET /api/tacticboards/header
// @access  Public - Returns only public boards and user's private boards
export const getAllTacticboardHeaders = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    let queryString: string = JSON.stringify(req.query);

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt|eq|ne|regex|options|in|nin)\b/g,
      (match) => `$${match}`
    );
    let parseObject = JSON.parse(queryString);

    // Extract pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Remove pagination params from query object
    delete parseObject.page;
    delete parseObject.limit;

    parseObject.$or = [{ isPrivate: false }];

    if (req.UserInfo?.id) {
      parseObject.$or.push({ isPrivate: true, user: req.UserInfo.id });
    }

    const accessTacticboards = await TacticboardAccess.find({
      user: req.UserInfo?.id,
    });

    if (accessTacticboards.length > 0) {
      parseObject.$or.push({
        _id: {
          $in: accessTacticboards.map((tacticboard) =>
            tacticboard.tacticboard.toString()
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

    const totalCount = await TacticBoard.countDocuments(parseObject);
    const boards = await TacticBoard.find(parseObject)
      .select("_id name tags isPrivate creator user")
      .skip(skip)
      .limit(limit);

    res.send({
      tacticboards: boards,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
      },
    });
  }
);

// @desc    Get tacticboard by ID
// @route   GET /api/tacticboards/:id
// @access  Public - Returns public board or user's private board
export const getById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      const result = await TacticBoard.findOne({ _id: req.params.id });
      if (result) {
        if (
          result.isPrivate &&
          result.user &&
          (!req.UserInfo?.id || req.UserInfo.id != result.user?.toString()) &&
          !req.UserInfo?.roles?.includes("Admin") &&
          !req.UserInfo?.roles?.includes("admin") &&
          !(await TacticboardAccess.exists({
            user: req.UserInfo?.id,
            tacticboard: req.params.id,
          }))
        ) {
          res.status(403).json({ message: "Forbidden" });
          return;
        }

        res.send(result);
      } else {
        res.status(404).json({ result: "No Record Found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  }
);

// @desc    Create new tacticboard
// @route   POST /api/tacticboards
// @access  Private - Authenticated users only
export const createNewTacticboard = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (req.UserInfo?.id) {
      let tacticboard = new TacticBoard(req.body);
      const result = await tacticboard.save();
      if (!result) {
        console.error("Couldn't create Tacticboard");
        res.send({ message: "Couldn't create Tacticboard" });
      } else {
        res.status(201).send({
          message: "Tacticboard created successfully",
          _id: result._id,
        });
      }
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  }
);

// @desc    Update entire tacticboard by ID
// @route   PATCH /api/tacticboards/:id
// @access  Private - Owner or Admin only
export const updateById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      const findResult = await TacticBoard.findOne({ _id: req.params.id });
      if (findResult) {
        if (!req.UserInfo?.id) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        const accessUser = await TacticboardAccess.findOne({
          user: req.UserInfo.id,
          tacticboard: req.params.id,
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

        const result = await TacticBoard.updateOne(
          { _id: req.params.id },
          { $set: req.body }
        );
        if (result.modifiedCount > 0) {
          res.json({ message: "Tacticboard updated successfully" });
        } else {
          res.json({ message: "No changes made" });
        }
      } else {
        res.status(404).json({ message: "TacticBoard not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  }
);

// @desc    Update specific page in tacticboard
// @route   PATCH /api/tacticboards/:id/:pageId
// @access  Private - Owner or Admin only
export const updatePageById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId, pageId } = req.params;
    if (
      mongoose.isValidObjectId(tacticBoardId) &&
      mongoose.isValidObjectId(pageId)
    ) {
      const findResult = await TacticBoard.findOne({ _id: req.params.id });
      if (findResult) {
        if (!req.UserInfo?.id) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        const accessUser = await TacticboardAccess.findOne({
          user: req.UserInfo.id,
          tacticboard: req.params.id,
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
          }
        );
        if (result.modifiedCount > 0) {
          res.json({ message: "Page updated successfully" });
        } else {
          res.status(404).json({ message: "Page not found" });
        }
      } else {
        res.status(404).json({ message: "TacticBoard not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  }
);

// @desc    Update tacticboard metadata only
// @route   PATCH /api/tacticboards/:id/meta
// @access  Private - Owner or Admin only
export const updateMetaById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;

    if (mongoose.isValidObjectId(tacticBoardId)) {
      const findResult = await TacticBoard.findOne({ _id: tacticBoardId });
      if (findResult) {
        if (!req.UserInfo?.id) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        const accessUser = await TacticboardAccess.findOne({
          user: req.UserInfo.id,
          tacticboard: req.params.id,
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

        // Destructure the fields to be updated from req.body, excluding `pages`
        const { name, isPrivate, tags, description, coaching_points } =
          req.body;
        if (isPrivate) {
          // Check if tacticboard is used in any exercises
          const exercisesUsingTacticboard = await Exercise.find({
            description_blocks: {
              $elemMatch: {
                tactics_board: tacticBoardId,
              },
            },
          });
          if (exercisesUsingTacticboard.length > 0) {
            res.status(400).json({
              message:
                "Cannot update tacticboard to private - it is being used in exercises",
              exercises: exercisesUsingTacticboard.map((ex) => ({
                id: ex._id,
                name: ex.name,
              })),
            });
            return;
          }
        }
        // Update the tacticboard with the new fields
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
          }
        );

        if (result.modifiedCount > 0) {
          res.json({ message: "TacticBoard updated successfully" });
        } else {
          res.status(404).json({ message: "No changes made" });
        }
      } else {
        res.status(404).json({ message: "TacticBoard not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  }
);

// @desc    Delete tacticboard by ID
// @route   DELETE /api/tacticboards/:id
// @access  Private - Owner or Admin only
export const deleteById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      const findResult = await TacticBoard.findOne({ _id: req.params.id });

      if (findResult) {
        // Check permissions
        if (!req.UserInfo?.id) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        const accessUser = await TacticboardAccess.findOne({
          user: req.UserInfo.id,
          tacticboard: req.params.id,
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

        // Check if tacticboard is used in any exercises
        const exercisesUsingTacticboard = await Exercise.find({
          description_blocks: {
            $elemMatch: {
              tactics_board: req.params.id,
            },
          },
        });
        if (exercisesUsingTacticboard.length > 0) {
          res.status(400).json({
            message:
              "Cannot delete tacticboard - it is being used in exercises",
            exercises: exercisesUsingTacticboard.map((ex) => ({
              id: ex._id,
              name: ex.name,
            })),
          });
          return;
        }

        // Delete Favorite Entries
        await TacticboardFav.deleteMany({ tacticboard: req.params.id });
        await TacticboardAccess.deleteMany({ tacticboard: req.params.id });
        // If not used in exercises, proceed with deletion
        const result = await TacticBoard.deleteOne({ _id: req.params.id });
        if (result.deletedCount > 0) {
          res.json({ message: "Tacticboard deleted successfully" });
        } else {
          res.status(404).json({ message: "TacticBoard not found" });
        }
      } else {
        res.status(404).json({ message: "No Record Found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  }
);

// @desc    Create new page in tacticboard
// @route   POST /api/tacticboards/:id/newPage
// @access  Private - Owner or Admin only
export const createNewPage = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id: tacticBoardId } = req.params;

    if (mongoose.isValidObjectId(tacticBoardId)) {
      const findResult = await TacticBoard.findOne({ _id: tacticBoardId });
      if (findResult) {
        // Authorization check
        if (!req.UserInfo?.id) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        const accessUser = await TacticboardAccess.findOne({
          user: req.UserInfo.id,
          tacticboard: req.params.id,
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

        // Add new page to the pages array
        const result = await TacticBoard.findOneAndUpdate(
          { _id: tacticBoardId },
          { $push: { pages: req.body } }
        );

        if (result) {
          res.json({ message: "New page added successfully" });
        } else {
          res.status(404).json({ message: "Failed to add new page" });
        }
      } else {
        res.status(404).json({ message: "TacticBoard not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  }
);

// @desc    Delete page from tacticboard
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
        // Authorization check
        if (!req.UserInfo?.id) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        const accessUser = await TacticboardAccess.findOne({
          user: req.UserInfo.id,
          tacticboard: req.params.id,
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

        const result = await TacticBoard.updateOne(
          { _id: tacticBoardId },
          { $pull: { pages: { _id: pageId } } }
        );

        if (result.modifiedCount > 0) {
          res.json({ message: "Page deleted successfully" });
        } else {
          res.status(404).json({ message: "Page not found" });
        }
      } else {
        res.status(404).json({ message: "TacticBoard not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID format" });
    }
  }
);

// @desc    Check if user has access to a tacticboard
// @route   GET /api/tacticboards/:id/access
// @access  Private - Authenticated users only
export const checkAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid tacticboard ID" });
      return;
    }

    const tacticboard = await TacticBoard.findById(req.params.id);
    if (!tacticboard) {
      res.status(404).json({ message: "Tacticboard not found" });
      return;
    }

    // Check if user is the owner
    if (tacticboard.user?.toString() === req.UserInfo.id) {
      res.json({ hasAccess: true, type: "owner", level: "edit" });
      return;
    }

    // Check if user is an admin
    if (
      req.UserInfo.roles?.includes("Admin") ||
      req.UserInfo.roles?.includes("admin")
    ) {
      res.json({ hasAccess: true, type: "admin", level: "edit" });
      return;
    }

    // Check if user has been granted access
    const access = await TacticboardAccess.findOne({
      user: req.UserInfo.id,
      tacticboard: req.params.id,
    });

    res.json({
      hasAccess: !!access,
      type: access ? "granted" : null,
      level: access?.access || null,
    });
  }
);

// @desc    Grant access to a tacticboard for a user
// @route   POST /api/tacticboards/:id/access
// @access  Private - Users with access
export const setAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid tacticboard ID" });
      return;
    }

    const tacticboard = await TacticBoard.findById(req.params.id);
    if (!tacticboard) {
      res.status(404).json({ message: "Tacticboard not found" });
      return;
    }

    // Check if user is the creator/owner or admin (only they can grant access)
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const isCreator =
      tacticboard.user?.toString() === req.UserInfo.id ||
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
      const accessEntry = await TacticboardAccess.findOneAndUpdate(
        { user: userId, tacticboard: req.params.id },
        { user: userId, tacticboard: req.params.id, access },
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

// @desc    Remove access to a tacticboard for a user
// @route   DELETE /api/tacticboards/:id/access
// @access  Private - Users with access
export const deleteAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid tacticboard ID" });
      return;
    }

    const tacticboard = await TacticBoard.findById(req.params.id);
    if (!tacticboard) {
      res.status(404).json({ message: "Tacticboard not found" });
      return;
    }

    // Check if user is the creator/owner or admin (only they can remove access)
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const isCreator =
      tacticboard.user?.toString() === req.UserInfo.id ||
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

    const result = await TacticboardAccess.deleteOne({
      user: userId,
      tacticboard: req.params.id,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Access entry not found" });
      return;
    }

    res.json({ message: "Access removed successfully" });
  }
);

// @desc    Get all users who have access to a tacticboard
// @route   GET /api/tacticboards/:id/access
// @access  Private - Users with access
export const getAllAccessUsers = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid tacticboard ID" });
      return;
    }

    const tacticboard = await TacticBoard.findById(req.params.id);
    if (!tacticboard) {
      res.status(404).json({ message: "Tacticboard not found" });
      return;
    }

    // Check if user has access to view access list
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const hasAccess =
      tacticboard.user?.toString() === req.UserInfo.id ||
      req.UserInfo.roles?.includes("Admin") ||
      req.UserInfo.roles?.includes("admin") ||
      (await TacticboardAccess.exists({
        user: req.UserInfo.id,
        tacticboard: req.params.id,
      }));

    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const accessEntries = await TacticboardAccess.find({
      tacticboard: req.params.id,
    }).populate("user", "name");

    res.json(accessEntries);
  }
);
