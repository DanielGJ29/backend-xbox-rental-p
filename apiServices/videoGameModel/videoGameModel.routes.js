const express = require("express");

//Controllers
const {
  createVideoGameModel,
  getAllVideoGameModel,
  getVideoGameModelById,
  updateVideoGameModel,
  deleteVideoGameModel,
  activeVideoGameModel,
} = require("./videoGameModel.controller");

//Middleware
const {
  validateSession,
  protecAdmin,
} = require("../../middleware/auth.middlewares");
const {
  videoGameModelExist,
} = require("../../middleware/videoGameModel.middleware");

const router = express.Router();

router.use(validateSession);

router.post("/", protecAdmin, createVideoGameModel);

router.get("/", getAllVideoGameModel);

router.put("/:id", activeVideoGameModel);

router.use("/:id", videoGameModelExist);

router.get("/:id", getVideoGameModelById);

router.patch("/:id", protecAdmin, updateVideoGameModel);

router.delete("/:id", protecAdmin, deleteVideoGameModel);

module.exports = router;
