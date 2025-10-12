import express from "express";
import * as authController from "../controllers/authController";
import { ddosLimiter, loginRateLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.use(ddosLimiter);

router.route("/").post(loginRateLimiter, authController.login);

router.route("/register").post(loginRateLimiter, authController.register);

router
  .route("/resetPassword")
  .post(loginRateLimiter, authController.resetPassword);

router
  .route("/updatePassword")
  .post(loginRateLimiter, authController.updatePassword);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

router.route("/verifyEmail").post(authController.verifyEmail);

export default router;
