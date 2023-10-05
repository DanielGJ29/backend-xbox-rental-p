const express = require("express");

//Controllers
const {
  createAccessory,
  getAllAccessory,
  getAccessoryById,
  updateAccessory,
  deleteAccessory,
} = require("../controllers/accessories.controller");

//Middleware
const {
  validateSession,
  protecAdmin,
} = require("../middleware/auth.middlewares");
const { accessoryExist } = require("../middleware/accessories.middleware");

//Utils
const { upload } = require("../util/multer");

const router = express.Router();

router.use(validateSession);

router.post("/", upload.single("img"), createAccessory);

router.get("/", getAllAccessory);

router.use("/:id", accessoryExist);

router.get("/:id", getAccessoryById);

router.patch("/:id", upload.single("img"), updateAccessory);

router.delete("/:id", protecAdmin, deleteAccessory);

module.exports = { accessoryRouter: router };
