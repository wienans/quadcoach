// T033 Practice Plan routes + T052 rate limiter applied
import { Router } from "express";
import {
  getPracticePlans,
  createPracticePlan,
  getPracticePlan,
  patchPracticePlan,
  deletePracticePlan,
  addAccess,
  removeAccess,
  getAllAccessUsers,
  sharePracticePlan,
} from "../controllers/practicePlanController";
import verifyJWT from "../middleware/verifyJWT";
import { ddosLimiter } from "../middleware/rateLimiter";

const router = Router();
router.use(verifyJWT); // apply auth middleware
router.use(ddosLimiter);

router.get("/", getPracticePlans);
router.post("/", createPracticePlan);
router.get("/:id", getPracticePlan);
router.patch("/:id", patchPracticePlan);
router.delete("/:id", deletePracticePlan);
router.post("/:id/access", addAccess);
router.get("/:id/access", getAllAccessUsers);
router.delete("/:id/access/", removeAccess);
router.route("/:id/share").post(sharePracticePlan);

export default router;
