const express = require("express");

//Controllers
const {
  createVideoGame,
  getAllVideoGame,
  getVideoGameById,
  updateVideoGame,
  deleteVideoGame,
  searchByKeyword,
  searchBySerialNumber,
} = require("./videoGame.controller");

//Middleware
const {
  validateSession,
  protecAdmin,
} = require("../../middleware/auth.middlewares");
const { videoGameExist } = require("../../middleware/videoGame.middleware");

//Utils
const { upload } = require("../../util/multer");

const router = express.Router();

router.use(validateSession);

router.post("/", upload.single("img"), createVideoGame);

router.get("/searchByKeyword/:keyword", searchByKeyword);

router.get("/searchBySerialNumber/:serialNumber", searchBySerialNumber);

router.get("/", getAllVideoGame);

router.use("/:id", videoGameExist);

router.get("/:id", getVideoGameById);

router.patch("/:id", protecAdmin, upload.single("img"), updateVideoGame);

router.delete("/:id", protecAdmin, deleteVideoGame);

module.exports = router;
