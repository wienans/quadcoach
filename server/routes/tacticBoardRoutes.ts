import express from "express";
import * as tacticBoardController from "../controllers/tacticBoardController";
import verifyJWT from "../middleware/verifyJWT";
import verifyJWTOptional from "../middleware/verifyJWTOptional";
import { ddosLimiter } from "../middleware/rateLimiter";
import { malformedShareTokenPath } from "../shareLinks/shareLinkHttp";
const router = express.Router();

// Apply optional JWT verification globally - allows public access to GET endpoints
router.use(verifyJWTOptional);
router.use(ddosLimiter);

// Public GET endpoints - no additional auth required
router.route("/header").get(tacticBoardController.getAllTacticBoardHeaders);
router.route("/share/:token").get(tacticBoardController.getByShareToken);
router.use(malformedShareTokenPath);

router
  .route("/")
  .get(tacticBoardController.getAllTacticBoards)
  .post(verifyJWT, tacticBoardController.createNewTacticBoard);

router
  .route("/:id")
  .get(tacticBoardController.getById)
  .put(verifyJWT, tacticBoardController.updateById)
  .delete(verifyJWT, tacticBoardController.deleteById);

// All access control endpoints require authentication
router
  .route("/:id/access")
  .get(verifyJWT, tacticBoardController.getAllAccessUsers)
  .post(verifyJWT, tacticBoardController.setAccess)
  .delete(verifyJWT, tacticBoardController.deleteAccess);

router
  .route("/:id/checkAccess")
  .get(verifyJWT, tacticBoardController.checkAccess);

router
  .route("/:id/share")
  .post(verifyJWT, tacticBoardController.shareTacticBoard);
router
  .route("/:id/duplicate")
  .post(verifyJWT, tacticBoardController.duplicateById);
router
  .route("/:id/share-link")
  .get(verifyJWT, tacticBoardController.getShareLink)
  .post(verifyJWT, tacticBoardController.createShareLink)
  .put(verifyJWT, tacticBoardController.rotateShareLink)
  .delete(verifyJWT, tacticBoardController.deleteShareLink);

// All page mutation endpoints require authentication
router
  .route("/:id/pages/:pageId")
  .patch(verifyJWT, tacticBoardController.updatePageById)
  .delete(verifyJWT, tacticBoardController.deletePageById);
router
  .route("/:id/meta")
  .patch(verifyJWT, tacticBoardController.updateMetaById);
router
  .route("/:id/newPage")
  .post(verifyJWT, tacticBoardController.createNewPage);
router
  .route("/:id/insertPage/:position")
  .post(verifyJWT, tacticBoardController.insertPageAtPosition);

export default router;
