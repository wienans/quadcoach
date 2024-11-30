import express from "express";
import * as usersController from "../controllers/usersController";
import verifyJWT from "../middleware/verifyJWT";
import * as favoritesController from "../controllers/favoritesController";
const router = express.Router();

router.use(verifyJWT);

router
  .route("/exercises")
  .get(favoritesController.getFavoriteExercises)
  .post(favoritesController.addFavoriteExercise)
  .delete(favoritesController.removeFavoriteExercise);

router
  .route("/tacticboards")
  .get(favoritesController.getFavoriteTacticboards)
  .post(favoritesController.addFavoriteTacticboard)
  .delete(favoritesController.removeFavoriteTacticboard);

router
  .route("/exerciseLists")
  .get(favoritesController.getFavoriteExerciseLists)
  .post(favoritesController.addFavoriteExerciseList)
  .delete(favoritesController.removeFavoriteExerciseList);

export default router;
