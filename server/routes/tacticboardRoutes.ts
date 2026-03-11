import express from "express";
import * as tacticboardController from "../controllers/tacticboardController";
import verifyJWT from "../middleware/verifyJWT";
import verifyJWTOptional from "../middleware/verifyJWTOptional";
import { ddosLimiter } from "../middleware/rateLimiter";
const router = express.Router();

// Apply optional JWT verification globally - allows public access to GET endpoints
router.use(verifyJWTOptional);
router.use(ddosLimiter);

// Public GET endpoints - no additional auth required
router.route("/header").get(tacticboardController.getAllTacticboardHeaders);
router.route("/share/:token").get(tacticboardController.getByShareToken);

router
  .route("/")
  .get(tacticboardController.getAllTacticboards)
  .post(verifyJWT, tacticboardController.createNewTacticboard);

router
  .route("/:id")
  .get(tacticboardController.getById)
  .put(verifyJWT, tacticboardController.updateById)
  .delete(verifyJWT, tacticboardController.deleteById);

// All access control endpoints require authentication
router
  .route("/:id/access")
  .get(verifyJWT, tacticboardController.getAllAccessUsers)
  .post(verifyJWT, tacticboardController.setAccess)
  .delete(verifyJWT, tacticboardController.deleteAccess);

router
  .route("/:id/checkAccess")
  .get(verifyJWT, tacticboardController.checkAccess);

router
  .route("/:id/share")
  .post(verifyJWT, tacticboardController.shareTacticBoard);
router
  .route("/:id/duplicate")
  .post(verifyJWT, tacticboardController.duplicateById);
router
  .route("/:id/share-link")
  .post(verifyJWT, tacticboardController.createShareLink)
  .delete(verifyJWT, tacticboardController.deleteShareLink);

// All page mutation endpoints require authentication
router
  .route("/:id/pages/:pageId")
  .patch(verifyJWT, tacticboardController.updatePageById)
  .delete(verifyJWT, tacticboardController.deletePageById);
router
  .route("/:id/meta")
  .patch(verifyJWT, tacticboardController.updateMetaById);
router
  .route("/:id/newPage")
  .post(verifyJWT, tacticboardController.createNewPage);
router
  .route("/:id/insertPage/:position")
  .post(verifyJWT, tacticboardController.insertPageAtPosition);

export default router;
