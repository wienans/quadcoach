import express from "express";
import * as tacticboardController from "../controllers/tacticboardController";

const router = express.Router();

router
  .route("/")
  .get(tacticboardController.getAllTacticboards)
  .post(tacticboardController.createNewTacticboard);

router
  .route("/:id")
  .get(tacticboardController.getById)
  .put(tacticboardController.updateById)
  .delete(tacticboardController.deleteById);

export default router;
