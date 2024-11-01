import express from "express";
import * as tacticboardController from "../controllers/tacticboardController";
import verifyJWT from "../middleware/verifyJWT";
const router = express.Router();

router.use(verifyJWT);

router
  .route("/")
  .get(tacticboardController.getAllTacticboards)
  .post(tacticboardController.createNewTacticboard);

router
  .route("/:id")
  .get(tacticboardController.getById)
  .put(tacticboardController.updateById)
  .delete(tacticboardController.deleteById);
router
  .route("/:id/:pageId")
  .patch(tacticboardController.updatePageById)
  .delete(tacticboardController.deletePageById);
router.route("/:id/meta").patch(tacticboardController.updateMetaById);
router.route("/:id/newPage").post(tacticboardController.createNewPage);

export default router;
