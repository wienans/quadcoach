import express from "express";
import * as usersController from "../controllers/usersController";
import verifyJWT from "../middleware/verifyJWT";
import { verifyAdmin } from "../middleware/verifyAdmin";
const router = express.Router();

router.use(verifyJWT);

router
  .route("/")
  .get(verifyAdmin, usersController.getAllUsers)
  .post(usersController.createNewUser)
  .put(usersController.updateUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

router.route("/online-count").get(verifyAdmin, usersController.getOnlineUsersCount);
router.route("/:id").get(usersController.getUserById);
router.route("/:id/exercises").get(usersController.getUserExercises);
router.route("/:id/tacticboards").get(usersController.getUserTacticboards);
router.route("/email/:email").get(usersController.getUserByEmail);

export default router;
