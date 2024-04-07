import express from "express";
import * as authController from "../controllers/authController";
import rateLimiter from "../middleware/rateLimiter";

const router = express.Router();

router.route("/").post(rateLimiter, authController.login);

router.route("/register").post(rateLimiter, authController.register);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

export default router;
