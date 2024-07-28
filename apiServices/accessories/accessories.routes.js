const express = require("express");

//Controllers
const {
  createAccessory,
  getAllAccessory,
  getAccessoryById,
  updateAccessory,
  deleteAccessory,
  searchByKeyword,
} = require("./accessories.controller");

//Middleware
const {
  validateSession,
  protecAdmin,
} = require("../../middleware/auth.middlewares");
const {
  accessoryExist,
  converterToLowerCase,
} = require("../../middleware/accessories.middleware");

//Utils
const { upload } = require("../../util/multer");

const router = express.Router();

router.use(validateSession);

router.post("/", upload.single("img"), converterToLowerCase, createAccessory);

router.get("/", getAllAccessory);

router.get("/searchByKeyword/:keyword", searchByKeyword);

router.use("/:id", accessoryExist);

router.get("/:id", getAccessoryById);

router.patch(
  "/:id",
  protecAdmin,
  upload.single("img"),
  converterToLowerCase,
  updateAccessory
);

router.delete("/:id", protecAdmin, deleteAccessory);

//module.exports = { accessoryRouter: router };
module.exports = router;
