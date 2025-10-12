// T033 Practice Plan routes + T052 rate limiter applied
import { Router } from "express";
import {
  createPracticePlan,
  getPracticePlan,
  patchPracticePlan,
  deletePracticePlan,
  addAccess,
  removeAccess,
  getAllAccessUsers,
} from "../controllers/practicePlanController";
import verifyJWT from "../middleware/verifyJWT";
import rateLimiter from "../middleware/rateLimiter"; // default (login-focused)

const router = Router();
router.use(verifyJWT as any); // apply auth middleware
// Apply relaxed rate limiter variant for editing (T052 adjustment) unless running tests
if (process.env.NODE_ENV !== "test") {
  router.use(rateLimiter as any);
}

router.post("/", createPracticePlan);
router.get("/:id", getPracticePlan);
router.patch("/:id", patchPracticePlan);
router.delete("/:id", deletePracticePlan);
router.post("/:id/access", addAccess);
router.get("/:id/access", getAllAccessUsers);
router.delete("/:id/access/:accessId", removeAccess);

export default router;
