import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ExerciseFav from "../models/exerciseFav";
import TacticboardFav from "../models/tacticboardFav";
import PracticePlanFav from "../models/practicePlanFav";
import mongoose from "mongoose";
import Exercise, { IExercise } from "../models/exercise";
import TacticBoard, { ITacticBoard } from "../models/tacticboard";

interface RequestWithUser extends Request {
  UserInfo?: {
    id: string;
    roles: string[];
  };
}

const checkUserAuthorization = (
  requestUserId: string,
  userInfoId?: string,
  roles: string[] = []
) => {
  return (
    userInfoId === requestUserId ||
    roles.some((role) => role.toLowerCase() === "admin")
  );
};

// Exercise Favorites
export const getFavoriteExercises = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.UserInfo?.id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }
    const favorites = await ExerciseFav.find({ user: req.UserInfo?.id }).sort({
      createdAt: -1,
    });

    res.json(favorites);
  }
);

export const getFavoriteExercisesHeaders = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.UserInfo?.id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }
    const favorites = await ExerciseFav.find({ user: req.UserInfo?.id }).sort({
      createdAt: -1,
    });
    const exerciseHeaders: IExercise[] = [];

    await Promise.all(
      favorites.map(async (favorite) => {
        const exercise = await Exercise.findById(favorite.exercise).select(
          "_id name"
        );
        if (exercise) {
          exerciseHeaders.push(exercise);
        }
      })
    );

    res.json(exerciseHeaders);
  }
);

export const addFavoriteExercise = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { userId, exerciseId } = req.body;

    if (
      !req.UserInfo?.id ||
      !checkUserAuthorization(userId, req.UserInfo.id, req.UserInfo.roles)
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(exerciseId)
    ) {
      res.status(400).json({ message: "Invalid exercise ID or User ID" });
      return;
    }

    try {
      const favorite = await ExerciseFav.create({
        user: userId,
        exercise: exerciseId,
      });

      res.status(201).json(favorite);
    } catch (error) {
      if ((error as any).code === 11000) {
        res.status(400).json({ message: "Already in favorites" });
      } else {
        throw error;
      }
    }
  }
);

export const removeFavoriteExercise = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { userId, exerciseId } = req.body;

    if (
      !req.UserInfo?.id ||
      !checkUserAuthorization(userId, req.UserInfo.id, req.UserInfo.roles)
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(exerciseId)
    ) {
      res.status(400).json({ message: "Invalid exercise ID or User ID" });
      return;
    }

    const result = await ExerciseFav.deleteOne({
      user: userId,
      exercise: exerciseId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Favorite not found" });
      return;
    }

    res.json({ message: "Favorite removed successfully" });
  }
);

// Tacticboard Favorites
export const getFavoriteTacticboards = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.UserInfo?.id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }
    const favorites = await TacticboardFav.find({
      user: req.UserInfo?.id,
    }).sort({ createdAt: -1 });

    res.json(favorites);
  }
);

export const getFavoriteTacticboardsHeaders = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.UserInfo?.id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }
    const favorites = await TacticboardFav.find({
      user: req.UserInfo?.id,
    }).sort({
      createdAt: -1,
    });
    const tacticboardHeaders: ITacticBoard[] = [];

    await Promise.all(
      favorites.map(async (favorite) => {
        const tacticboard = await TacticBoard.findById(
          favorite.tacticboard
        ).select("_id name");
        if (tacticboard) {
          tacticboardHeaders.push(tacticboard);
        }
      })
    );

    res.json(tacticboardHeaders);
  }
);

export const addFavoriteTacticboard = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { userId, tacticboardId } = req.body;

    if (
      !req.UserInfo?.id ||
      !checkUserAuthorization(userId, req.UserInfo.id, req.UserInfo.roles)
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(tacticboardId)
    ) {
      res.status(400).json({ message: "Invalid tacticboard ID or User ID" });
      return;
    }

    try {
      const favorite = await TacticboardFav.create({
        user: userId,
        tacticboard: tacticboardId,
      });

      res.status(201).json(favorite);
    } catch (error) {
      if ((error as any).code === 11000) {
        res.status(400).json({ message: "Already in favorites" });
      } else {
        throw error;
      }
    }
  }
);

export const removeFavoriteTacticboard = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { userId, tacticboardId } = req.body;

    if (
      !req.UserInfo?.id ||
      !checkUserAuthorization(userId, req.UserInfo.id, req.UserInfo.roles)
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(tacticboardId)
    ) {
      res.status(400).json({ message: "Invalid tacticboard ID or User ID" });
      return;
    }

    const result = await TacticboardFav.deleteOne({
      user: userId,
      tacticboard: tacticboardId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Favorite not found" });
      return;
    }

    res.json({ message: "Favorite removed successfully" });
  }
);

// Practice Plan Favorites
export const getFavoritePracticePlans = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    if (!mongoose.isValidObjectId(req.UserInfo?.id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }
    const favorites = await PracticePlanFav.find({
      user: req.UserInfo?.id,
    }).sort({ createdAt: -1 });

    res.json(favorites);
  }
);

export const addFavoritePracticePlan = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { userId, planId } = req.body;

    if (
      !req.UserInfo?.id ||
      !checkUserAuthorization(userId, req.UserInfo.id, req.UserInfo.roles)
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(planId)
    ) {
      res.status(400).json({ message: "Invalid practice plan ID or User ID" });
      return;
    }

    try {
      const favorite = await PracticePlanFav.create({
        user: userId,
        practicePlan: planId,
      });

      res.status(201).json(favorite);
    } catch (error) {
      if ((error as any).code === 11000) {
        res.status(400).json({ message: "Already in favorites" });
      } else {
        throw error;
      }
    }
  }
);

export const removeFavoritePracticePlan = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { userId, planId } = req.body;

    if (
      !req.UserInfo?.id ||
      !checkUserAuthorization(userId, req.UserInfo.id, req.UserInfo.roles)
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(planId)
    ) {
      res.status(400).json({ message: "Invalid practice plan ID or User ID" });
      return;
    }

    const result = await PracticePlanFav.deleteOne({
      user: userId,
      practicePlan: planId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Favorite not found" });
      return;
    }

    res.json({ message: "Favorite removed successfully" });
  }
);
