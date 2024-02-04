import express from "express";
import * as usersController from "../controllers/usersController";

const router = express.Router();

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .put(usersController.updateUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

router.route("/:id").get(usersController.getUserById);

export default router;
