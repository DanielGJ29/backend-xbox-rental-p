const express = require("express");

//Controllers
const {
  createVideoGameModel,
  getAllVideoGameModel,
  getVideoGameModelById,
  updateVideoGameModel,
  deleteVideoGameModel,
  activeVideoGameModel,
} = require("../controllers/videoGameModel.controller");

//Middleware
const { validateSession } = require("../middleware/auth.middlewares");
const {
  videoGameModelExist,
} = require("../middleware/videoGameModel.middleware");

const router = express.Router();

router.use(validateSession);

router.post("/", createVideoGameModel);

router.get("/", getAllVideoGameModel);

router.put("/:id", activeVideoGameModel);

router.use("/:id", videoGameModelExist);

router.get("/:id", getVideoGameModelById);

router.patch("/:id", updateVideoGameModel);

router.delete("/:id", deleteVideoGameModel);

module.exports = { videoGameModelRouter: router };
