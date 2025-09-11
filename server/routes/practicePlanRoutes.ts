import express from "express";
import * as practicePlanController from "../controllers/practicePlanController";
import verifyJWT from "../middleware/verifyJWT";

const router = express.Router();

router
  .route("/")
  .get(practicePlanController.getAllPracticePlans)
  .post(verifyJWT, practicePlanController.createPracticePlan);

router
  .route("/:id")
  .get(practicePlanController.getPracticePlan)
  .put(verifyJWT, practicePlanController.updatePracticePlan)
  .delete(verifyJWT, practicePlanController.deletePracticePlan);

export default router;