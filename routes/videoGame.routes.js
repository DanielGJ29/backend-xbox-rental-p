const express = require("express");

//Controllers
const {
  createVideoGame,
  getAllVideoGame,
  getVideoGameById,
  updateVideoGame,
  deleteVideoGame,
} = require("../controllers/videoGame.controller");

//Middleware
const {
  validateSession,
  protecAdmin,
} = require("../middleware/auth.middlewares");
const { videoGameExist } = require("../middleware/videoGame.middleware");

//Utils
const { upload } = require("../util/multer");

const router = express.Router();

router.use(validateSession);

router.post("/", upload.single("img"), createVideoGame);

router.get("/", getAllVideoGame);

router.use("/:id", videoGameExist);

router.get("/:id", getVideoGameById);

router.patch("/:id", upload.single("img"), updateVideoGame);

router.delete("/:id", protecAdmin, deleteVideoGame);

module.exports = { videoGameRouter: router };
