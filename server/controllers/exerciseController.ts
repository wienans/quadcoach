import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Exercise from "../models/exercise";
import mongoose from "mongoose";
import ExerciseFav from "../models/exerciseFav";
import ExerciseAccess from "../models/exerciseAccess";
import User from "../models/user";
import { PracticePlan } from "../models/practicePlan";
import TacticBoard from "../models/tacticBoard";
import {
  getResourceAuthorization,
  requireResourceAuthorization,
  serializeResourceAuthorizationDecision,
} from "./helpers/requireResourceAuthorization";
import { authorizationResourceFor } from "../authorization/resourceAuthorization";
import {
  ExerciseBlockDto,
  ExerciseDto,
  fromLegacyExerciseRequest,
  toLegacyExercisePersistence,
} from "../compatibility/tacticBoardCompatibility";
import {
  browse,
  CollectionQueryInfrastructureError,
  CollectionQueryValidationError,
  listFacet,
  parseCollectionFacetQuery,
  parseCollectionQuery,
} from "../collectionQuery";
import { collectionVisibility } from "../collectionQuery/types";

interface RequestWithUser extends Request {
  UserInfo?: {
    id: string;
    roles: string[];
  };
}

// Add this type guard function at the top of the file, after the imports
function isMongoError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error;
}

function extractTacticBoardIdsFromBlocks(
  descriptionBlocks: ExerciseBlockDto[] | undefined
): string[] {
  if (descriptionBlocks === undefined) {
    return [];
  }

  return descriptionBlocks
    .map((block) => {
      const candidate = block.tacticBoardId;

      if (typeof candidate === "string" && mongoose.isValidObjectId(candidate)) {
        return candidate;
      }

      if (
        candidate &&
        typeof candidate === "object" &&
        "_id" in (candidate as Record<string, unknown>)
      ) {
        const nestedId = (candidate as { _id?: unknown })._id;
        if (typeof nestedId === "string" && mongoose.isValidObjectId(nestedId)) {
          return nestedId;
        }
      }

      return null;
    })
    .filter((id): id is string => id !== null);
}

async function rejectIfAnyPrivateTacticBoard(
  tacticBoardIds: string[],
  res: Response
): Promise<boolean> {
  if (tacticBoardIds.length === 0) {
    return false;
  }

  const privateTacticBoards = await TacticBoard.find({
    _id: { $in: tacticBoardIds },
    isPrivate: true,
  }).select("_id name");

  if (privateTacticBoards.length === 0) {
    return false;
  }

  res.status(400).json({
    message:
      "Private Tactic Boards cannot be linked to exercises. Please make them public first.",
    tacticboards: privateTacticBoards.map((tacticBoard) => ({
      id: tacticBoard._id,
      name: tacticBoard.name,
    })),
  });

  return true;
}

function sendCollectionQueryError(error: unknown, res: Response): boolean {
  if (error instanceof CollectionQueryValidationError) {
    res.status(error.statusCode).json(error.serialize());
    return true;
  }
  if (error instanceof CollectionQueryInfrastructureError) {
    res.status(error.statusCode).json({ message: error.message });
    return true;
  }
  return false;
}

// @desc    Browse exercises
// @route   GET /api/exercises
// @access  Public
export const getAllExercises = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const intent = parseCollectionQuery("exercise", req.query);
      res.json(
        await browse({ intent, visibility: collectionVisibility.all() }),
      );
    } catch (error) {
      if (!sendCollectionQueryError(error, res)) throw error;
    }
  },
);

async function getExerciseFacet(
  req: Request,
  res: Response,
  facet: "tags" | "materials",
): Promise<void> {
  try {
    parseCollectionFacetQuery(req.query);
    res.json(
      await listFacet({
        resource: "exercise",
        facet,
        visibility: collectionVisibility.all(),
      }),
    );
  } catch (error) {
    if (!sendCollectionQueryError(error, res)) throw error;
  }
}

export const getExerciseTags = asyncHandler(
  async (req: Request, res: Response) => getExerciseFacet(req, res, "tags"),
);

export const getExerciseMaterials = asyncHandler(
  async (req: Request, res: Response) =>
    getExerciseFacet(req, res, "materials"),
);

// @desc    Get exercise by ID
// @route   GET /api/exercises/:id
// @access  Public
export const getById = asyncHandler(async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid exercise ID" });
    return;
  }

  const result = await Exercise.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.status(404).json({ message: "Exercise not found" });
  }
});

// @desc    Create new exercise
// @route   POST /api/exercises
// @access  Private - Authenticated users only
export const createNewExercise = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (req.UserInfo?.id) {
      const exerciseRequest = fromLegacyExerciseRequest(req.body);
      const tacticBoardIds = Array.from(
        new Set(extractTacticBoardIdsFromBlocks(exerciseRequest.descriptionBlocks)),
      );

      if (await rejectIfAnyPrivateTacticBoard(tacticBoardIds, res)) {
        return;
      }

      const exercise = new Exercise(toLegacyExercisePersistence(exerciseRequest));
      const result = await exercise.save();
      if (!result) {
        console.error("Couldn't create Exercise");
      }
      res.status(201).send(result);
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  }
);

// @desc    Update exercise by ID
// @route   PATCH /api/exercises/:id
// @access  Private - Owner or Admin only
export const updateById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      const findResult = await Exercise.findOne({ _id: req.params.id });
      if (findResult) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.exercise(req.params.id, findResult),
            "edit",
          ))
        ) {
          return;
        }

        const exerciseRequest = fromLegacyExerciseRequest(req.body);
        const requestedTacticBoardIds = Array.from(
          new Set(extractTacticBoardIdsFromBlocks(exerciseRequest.descriptionBlocks)),
        );
        const existingExercise = fromLegacyExerciseRequest(
          findResult.toObject() as unknown as Record<string, unknown>,
        );
        const existingTacticBoardIds = Array.from(
          new Set(
            extractTacticBoardIdsFromBlocks(existingExercise.descriptionBlocks)
          )
        );

        const addedTacticBoardIds = requestedTacticBoardIds.filter(
          (tacticBoardId) => !existingTacticBoardIds.includes(tacticBoardId)
        );

        if (await rejectIfAnyPrivateTacticBoard(addedTacticBoardIds, res)) {
          return;
        }

        const updates: ExerciseDto = { ...exerciseRequest };
        delete updates.user;
        delete updates.owner;

        const result = await Exercise.updateOne(
          { _id: req.params.id },
          { $set: toLegacyExercisePersistence(updates) }
        );
        res.send(result);
      } else {
        res.send({ result: "No Record Found" });
      }
    } else {
      res.send({ result: "No Record Found" });
    }
  }
);

// @desc    Delete exercise by ID
// @route   DELETE /api/exercises/:id
// @access  Private - Owner or Admin only
export const deleteById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (mongoose.isValidObjectId(req.params.id)) {
      const findResult = await Exercise.findOne({ _id: req.params.id });
      if (findResult) {
        if (
          !(await requireResourceAuthorization(
            req,
            res,
            authorizationResourceFor.exercise(req.params.id, findResult),
            "delete",
          ))
        ) {
          return;
        }

        // Check if exercise is used in any practice plans
        const practicePlansUsingExercise = await PracticePlan.find({
          "sections.groups.items.exerciseId": req.params.id,
        });

        if (practicePlansUsingExercise.length > 0) {
          res.status(400).json({
            message:
              "Cannot delete exercise - it is being used in practice plans",
            practicePlans: practicePlansUsingExercise.map((pp) => ({
              id: pp._id,
              name: pp.name,
            })),
          });
          return;
        }

        // Delete Favorite Entries
        await ExerciseFav.deleteMany({ exercise: req.params.id });

        const result = await Exercise.deleteOne({ _id: req.params.id });
        res.send(result);
      } else {
        res.send({ result: "No Record Found" });
      }
    } else {
      res.send({ result: "No Record Found" });
    }
  }
);

// @desc    Get related exercises by ID
// @route   GET /api/exercises/:id/related
// @access  Public
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

// @desc    Grant access to an exercise for a user
// @route   POST /api/exercises/:id/access
// @access  Private - Users with access
export const setAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid exercise ID" });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.exercise(req.params.id, exercise),
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

    if (access !== "edit") {
      res.status(400).json({
        message:
          "Access level must be 'edit' (view access is public for all exercises)",
      });
      return;
    }

    try {
      const accessEntry = await ExerciseAccess.create({
        user: userId,
        exercise: req.params.id,
        access,
      });
      res.status(201).json(accessEntry);
    } catch (error) {
      // Handle duplicate access grants
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

// @desc    Remove access to an exercise for a user
// @route   DELETE /api/exercises/:id/access
// @access  Private - Users with access
export const deleteAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid exercise ID" });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.exercise(req.params.id, exercise),
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

    const result = await ExerciseAccess.deleteOne({
      user: userId,
      exercise: req.params.id,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Access entry not found" });
      return;
    }

    res.json({ message: "Access removed successfully" });
  }
);

// @desc    Check if user has access to an exercise
// @route   GET /api/exercises/:id/access
// @access  Private - Authenticated users only
export const checkAccess = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!req.UserInfo?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid exercise ID" });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    const decision = await getResourceAuthorization(
      req,
      authorizationResourceFor.exercise(req.params.id, exercise),
      "view",
    );

    res.json(serializeResourceAuthorizationDecision(decision));
  }
);

// @desc    Get all users who have access to an exercise
// @route   GET /api/exercises/:id/access
// @access  Private - Owner or Admin only
export const getAllAccessUsers = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid exercise ID" });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }
    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.exercise(req.params.id, exercise),
        "manageAccess",
      ))
    ) {
      return;
    }

    const accessEntries = await ExerciseAccess.find({
      exercise: req.params.id,
    }).populate("user", "name");

    res.json(accessEntries);
  }
);

// @desc    Share exercise with user by email
// @route   POST /api/exercises/:id/share
// @access  Private - Owner or Admin only
export const shareExercise = asyncHandler(
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

    if (access !== "edit") {
      res.status(400).json({
        message:
          "Access must be 'edit' (view access is public for all exercises)",
      });
      return;
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    if (
      !(await requireResourceAuthorization(
        req,
        res,
        authorizationResourceFor.exercise(req.params.id, exercise),
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

    const existingAccess = await ExerciseAccess.findOne({
      exercise: req.params.id,
      user: targetUser._id,
    });

    if (existingAccess) {
      existingAccess.access = access;
      await existingAccess.save();
      res.json({ message: "Access updated successfully" });
    } else {
      const newAccess = new ExerciseAccess({
        exercise: req.params.id,
        user: targetUser._id,
        access,
      });
      await newAccess.save();
      res.status(201).json({ message: "Access granted successfully" });
    }
  }
);
