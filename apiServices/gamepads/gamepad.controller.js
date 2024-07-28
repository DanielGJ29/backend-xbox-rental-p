const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { Sequelize, Op } = require("sequelize");

//Utils
const { catchAsync } = require("../../util/catchAsync");
const { storage } = require("../../util/firebase");
const { AppError } = require("../../util/appError");
const { filterObj } = require("../../util/filterObj");

//Models
const { Gamepad } = require("./gamepad.model");
const {
  VideoGameName,
} = require("../../apiServices/videoGameName/videoGameName.model");

//?NEW GAMEPAD
exports.createGamepad = catchAsync(async (req, res, next) => {
  const { videoGameNameId, color, serialNumber, connectionType } = req.body;
  const { currentUser } = req;
  console.log("REQUEST", req.body);

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
    include: {
      model: VideoGameName,
    },
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

//?SEARCH BY SERIAL NUMBER
exports.searchBySeriaNumber = catchAsync(async (req, res, next) => {
  const { serialNumber } = req.params;

  const gamepad = await Gamepad.findOne({
    where: { status: "active", serialNumber: serialNumber },
    include: [VideoGameName],
    //attributes: { exclude: ["videoGameNameId"] },
    // include: {
    //   model: VideoGameName,
    //   attributes: ["name"],
    // },
  });

  if (!gamepad) {
    //return next(new AppError(404, `No se encontro ningun gamepad`, 1));
    res.status(200).json({ status: "success", data: gamepad });
    return;
  }

  console.log(gamepad);

  res.status(200).json({ status: "success", data: gamepad });
});

//?SEARCH BY KEYWORD
exports.searchByKeyword = catchAsync(async (req, res, next) => {
  const { keyword } = req.params;

  // select g.*, n.name
  // from gamepads as g
  //    left JOIN "videoGameNames" as n on n.id = g."videoGameNameId"
  // where concat( n."name", ' ',g."serialNumber",' ',g."connectionType") ilike concat('%','xbox','%')
  // and g.status = 'active'
  const gamepad = await Gamepad.findAll({
    where: {
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn(
            "concat",
            Sequelize.col("videoGameName.name"),
            " ",
            Sequelize.col("serialNumber"),
            " ",
            Sequelize.col("connectionType")
          ),
          {
            [Op.like]: `%${keyword}%`,
          }
        ),

        { status: "active" },
      ],
    },
    include: [
      {
        model: VideoGameName,
        //as: "n",
        // where: { status: "active" },
        attributes: { exclude: ["status", "createdAt", "updatedAt"] },
      },
    ],
  });

  if (!gamepad) {
    //return next(new AppError(404, `No se encontro ningun gamepad`, 1));
    res.status(200).json({ status: "success", data: gamepad });
    return;
  }

  res.status(200).json({ status: "success", data: gamepad });
});
