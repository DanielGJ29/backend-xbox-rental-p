const express = require("express");

//Controllers
const {
  createVideoGameName,
  getAllVideoGameName,
  getVideoGameNameById,
  updateVideoGameName,
  deleteVideoGameName,
  activeVideoGameName,
} = require("./videoGameName.controller");

//Middleware
const {
  validateSession,
  protecAdmin,
} = require("../../middleware/auth.middlewares");
const {
  videoGameNameExist,
} = require("../../middleware/videoGameName.middleware");

const router = express.Router();

router.use(validateSession);

router.post("/", protecAdmin, createVideoGameName);

router.get("/", getAllVideoGameName);

router.put("/:id", activeVideoGameName);

router.use("/:id", videoGameNameExist);

router.get("/:id", getVideoGameNameById);

router.patch("/:id", protecAdmin, updateVideoGameName);

router.delete("/:id", protecAdmin, deleteVideoGameName);

module.exports = router;
