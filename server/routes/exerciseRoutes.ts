import express from "express";
import * as exerciseController from "../controllers/exerciseController";
import verifyJWT from "../middleware/verifyJWT";
const router = express.Router();

router
  .route("/")
  .get(exerciseController.getAllExercises)
  .post(verifyJWT, exerciseController.createNewExercise);

router
  .route("/:id")
  .get(exerciseController.getById)
  .put(verifyJWT, exerciseController.updateById)
  .delete(verifyJWT, exerciseController.deleteById);

router
  .route("/:id/access")
  .get(verifyJWT, exerciseController.getAllAccessUsers)
  .post(verifyJWT, exerciseController.setAccess)
  .delete(verifyJWT, exerciseController.deleteAccess);

router.route("/:id/checkAccess").get(verifyJWT, exerciseController.checkAccess);

router.route("/:id/relatedExercises").get(exerciseController.getRelatedById);

export default router;
