const express = require("express");
const { body } = require("express-validator");

//Controllers
const {
  createUser,
  getAllUsers,
  getUserById,
  login,
  checkToken,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

//Middlewares
const {
  validateSession,
  protecAdmin,
} = require("../middleware/auth.middlewares");
const {
  userExist,
  protectAccountOwner,
} = require("../middleware/user.middleware");
const {
  createUserValidators,
  validateResult,
} = require("../middleware/validators.middleware");

//Utils
const { upload } = require("../util/multer");

const router = express.Router();

router.post("/login", login);

router.post(
  "/",
  upload.single("avatarUrl"),
  createUserValidators,
  validateResult,
  createUser
);

router.use(validateSession, protecAdmin);

router.get("/", getAllUsers);

router.get("/check-token", checkToken);

router.use("/:id", userExist);

router.get("/:id", getUserById);

router.patch(
  "/:id",
  protectAccountOwner,
  upload.single("avatarUrl"),
  updateUser
);

router.delete("/:id", protectAccountOwner, deleteUser);

module.exports = { usersRouter: router };
