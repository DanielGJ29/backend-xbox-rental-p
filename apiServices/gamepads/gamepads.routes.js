const express = require("express");

//Controllers
const {
  createGamepad,
  getAllGamepad,
  getGamepadById,
  updateGamepad,
  deleteGamepad,
  searchBySeriaNumber,
  searchByKeyword,
} = require("./gamepad.controller");

//Middleware
const {
  validateSession,
  protecAdmin,
} = require("../../middleware/auth.middlewares");
const { gamepadExist } = require("../../middleware/gamepad.middleware");

const router = express.Router();

router.use(validateSession);

router.post("/", createGamepad);

router.get("/", getAllGamepad);

router.get("/searchBySerialNumber/:serialNumber", searchBySeriaNumber);

router.get("/searchBykeyword/:keyword", searchByKeyword);

router.use("/:id", gamepadExist);

router.get("/:id", getGamepadById);

router.patch("/:id", protecAdmin, updateGamepad);

router.delete("/:id", protecAdmin, deleteGamepad);

module.exports = router;
