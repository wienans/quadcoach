import express from "express";
import * as tacticboardController from "../controllers/tacticboardController";
import verifyJWT from "../middleware/verifyJWT";
import { ddosLimiter } from "../middleware/rateLimiter";
const router = express.Router();

router.use(verifyJWT);
router.use(ddosLimiter);

router.route("/header").get(tacticboardController.getAllTacticboardHeaders);

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
  .route("/:id/access")
  .get(tacticboardController.getAllAccessUsers)
  .post(tacticboardController.setAccess)
  .delete(tacticboardController.deleteAccess);

router.route("/:id/checkAccess").get(tacticboardController.checkAccess);

router.route("/:id/share").post(tacticboardController.shareTacticBoard);

router
  .route("/:id/pages/:pageId")
  .patch(tacticboardController.updatePageById)
  .delete(tacticboardController.deletePageById);
router.route("/:id/meta").patch(tacticboardController.updateMetaById);
router.route("/:id/newPage").post(tacticboardController.createNewPage);
router
  .route("/:id/insertPage/:position")
  .post(tacticboardController.insertPageAtPosition);

export default router;
