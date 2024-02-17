import express from "express";
import * as exerciseController from "../controllers/exerciseController";

const router = express.Router();

router
  .route("/")
  .get(exerciseController.getAllExercises)
  .post(exerciseController.createNewExercise);

router
  .route("/:id")
  .get(exerciseController.getById)
  .put(exerciseController.updateById)
  .delete(exerciseController.deleteById);

router.route("/:id/relatedExercises").get(exerciseController.getRelatedById);

export default router;
