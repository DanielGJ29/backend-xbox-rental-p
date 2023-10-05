const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { Op } = require("sequelize");

//Utils
const { catchAsync } = require("../util/catchAsync");
const { storage } = require("../util/firebase");
const { AppError } = require("../util/appError");
const { filterObj } = require("../util/filterObj");

//Models
const { Gamepad } = require("../Models/gamepad.model");
const { VideoGameName } = require("../Models/videoGameName.model");

//?NEW GAMEPAD
exports.createGamepad = catchAsync(async (req, res, next) => {
  const { videoGameNameId, color, serialNumber, connectionType } = req.body;
  const { currentUser } = req;

  const gamepad = await Gamepad.findOne({
    where: { status: "active", serialNumber },
  });

  if (gamepad) {
    return next(
      new AppError(
        404,
        `The gamepad with serial number: ${serialNumber} is already registered`,
        1
      )
    );
  }

  //Query create
  const newGamepad = await Gamepad.create({
    videoGameNameId,
    color,
    serialNumber,
    connectionType,
    userId: currentUser.id,
  });

  res.status(200).json({ status: "success", data: newGamepad });
});

//?GET ALL GAMEPAD
exports.getAllGamepad = catchAsync(async (req, res, next) => {
  const videoGame = await Gamepad.findAll({
    where: { status: "active" },
    attributes: { exclude: ["videoGameNameId"] },
    include: [VideoGameName],
  });

  res.status(200).json({ status: "success", data: videoGame });
});

//?GET GAMEPAD BY ID
exports.getGamepadById = catchAsync(async (req, res, next) => {
  const { gamepad } = req;

  res.status(200).json({ status: "success", data: gamepad });
});

//?UPDATE GAMEPAD BY ID
exports.updateGamepad = catchAsync(async (req, res, next) => {
  const { gamepad } = req;
  const { serialNumber } = req.body;

  //Check that it is not repeated by the serial number
  //SELECT * FROM videoGame WHERE status = "active" AND serialNumber = serialNumber AND id != videoGame.id
  if (serialNumber) {
    const existGamepad = await Gamepad.findAll({
      where: {
        status: "active",
        serialNumber,
        id: { [Op.ne]: gamepad.id },
      },
    });

    if (existGamepad.length > 0) {
      return next(
        new AppError(
          404,
          `The gamepad with serial number: ${serialNumber} is already registered`,
          1
        )
      );
    }
  }

  const data = filterObj(
    req.body,
    "videoGameNameId",
    "color",
    "serialNumber",
    "connectionType",
    "stateId"
  );

  await gamepad.update({ ...data });

  res.status(200).json({ status: "success" });
});

//?DELETE GAMEPAD BY ID
exports.deleteGamepad = catchAsync(async (req, res, next) => {
  const { gamepad } = req;

  gamepad.update({ status: "delete" });

  res.status(200).json({ status: "success" });
});
