// T033 Practice Plan routes + T052 rate limiter applied
import { Router } from "express";
import {
  getPracticePlans,
  createPracticePlan,
  getPracticePlan,
  patchPracticePlan,
  deletePracticePlan,
  setAccess,
  deleteAccess,
  getAllAccessUsers,
  sharePracticePlan,
  createShareLink,
  deleteShareLink,
  getByShareToken,
} from "../controllers/practicePlanController";
import verifyJWT from "../middleware/verifyJWT";
import verifyJWTOptional from "../middleware/verifyJWTOptional";
import { ddosLimiter } from "../middleware/rateLimiter";

const router = Router();
// Apply optional JWT verification globally - allows public access to GET endpoints
router.use(verifyJWTOptional);
router.use(ddosLimiter);

// Public GET endpoints - no additional auth required
router.get("/", getPracticePlans);
router.get("/share/:token", getByShareToken);
router.get("/:id", getPracticePlan);

// All mutation endpoints require authentication
router.post("/", verifyJWT, createPracticePlan);
router.patch("/:id", verifyJWT, patchPracticePlan);
router.delete("/:id", verifyJWT, deletePracticePlan);

// All access control endpoints require authentication
router.post("/:id/access", verifyJWT, setAccess);
router.get("/:id/access", verifyJWT, getAllAccessUsers);
router.delete("/:id/access", verifyJWT, deleteAccess);
router.route("/:id/share").post(verifyJWT, sharePracticePlan);
router
  .route("/:id/share-link")
  .post(verifyJWT, createShareLink)
  .delete(verifyJWT, deleteShareLink);

export default router;
