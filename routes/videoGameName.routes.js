const express = require("express");

//Controllers
const {
  createVideoGameName,
  getAllVideoGameName,
  getVideoGameNameById,
  updateVideoGameName,
  deleteVideoGameName,
  activeVideoGameName,
} = require("../controllers/videoGameName.controller");

//Middleware
const { validateSession } = require("../middleware/auth.middlewares");
const {
  videoGameNameExist,
} = require("../middleware/videoGameName.middleware");

const router = express.Router();

router.use(validateSession);

router.post("/", createVideoGameName);

router.get("/", getAllVideoGameName);

router.put("/:id", activeVideoGameName);

router.use("/:id", videoGameNameExist);

router.get("/:id", getVideoGameNameById);

router.patch("/:id", updateVideoGameName);

router.delete("/:id", deleteVideoGameName);

module.exports = { videoGameNameRouter: router };
