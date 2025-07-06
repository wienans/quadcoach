import express from "express";
import * as usersController from "../controllers/usersController";
import verifyJWT from "../middleware/verifyJWT";
const router = express.Router();

router.use(verifyJWT);

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .put(usersController.updateUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

router.route("/:id").get(usersController.getUserById);
router.route("/email/:email").get(usersController.getUserByEmail);

export default router;
