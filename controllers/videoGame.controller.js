const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { Op } = require("sequelize");

//Utils
const { catchAsync } = require("../util/catchAsync");
const { storage } = require("../util/firebase");
const { AppError } = require("../util/appError");
const { filterObj } = require("../util/filterObj");

//Models
const { VideoGame } = require("../Models/videoGame.model");
const { VideoGameName } = require("../Models/videoGameName.model");
const { VideoGameModel } = require("../Models/videoGameModel.model");

//?NEW VIDEO GAME
exports.createVideoGame = catchAsync(async (req, res, next) => {
  const { nameId, modelId, color, serialNumber, hardHDD } = req.body;
  const { id } = req.currentUser;

  const videoGame = await VideoGame.findOne({
    where: { status: "active", serialNumber },
  });

  if (videoGame) {
    return next(
      new AppError(
        404,
        `The videoGameConsole with serial number: ${serialNumber} is already registered`,
        1
      )
    );
  }

  //Upload file
  let countId = 0;
  const videoGames = await VideoGame.findAll();
  if (videoGames.length > 0) {
    countId = videoGames.length + 1;
  } else {
    countId = 1;
  }

  const imgRef = ref(
    storage,
    `xbox img/${countId}-${Date.now()}-${req.file.originalname}`
  );
  const result = await uploadBytes(imgRef, req.file.buffer);
  const imgDownloadUrl = await getDownloadURL(imgRef);

  //Query create
  const newVideoGame = await VideoGame.create({
    nameId,
    modelId,
    color,
    serialNumber,
    hardHDD,
    imgUrl: result.metadata.fullPath,
    userId: id,
  });

  newVideoGame.imgUrl = imgDownloadUrl;

  res.status(200).json({ status: "success", data: newVideoGame });
});

//?GET ALL VIDEO GAME
exports.getAllVideoGame = catchAsync(async (req, res, next) => {
  const videoGame = await VideoGame.findAll({
    where: { status: "active" },

    include: [VideoGameName, VideoGameModel],
    attributes: { exclude: ["nameId", "modelId"] },
  });

  //dowload img
  const userPromises = videoGame.map(async (item) => {
    const imgRef = ref(storage, item.imgUrl);
    const imgDownloadUrl = await getDownloadURL(imgRef);
    item.imgUrl = imgDownloadUrl;
    return item;
  });

  const resolveVideoGame = await Promise.all(userPromises);
  res.status(200).json({ status: "success", data: resolveVideoGame });
});

//?GET VIDEO GAME BY ID
exports.getVideoGameById = catchAsync(async (req, res, next) => {
  const { videoGame } = req;

  //dowload img
  const imgRef = ref(storage, videoGame.imgUrl);
  const imgDownloadUrl = await getDownloadURL(imgRef);
  videoGame.imgUrl = imgDownloadUrl;

  res.status(200).json({ status: "success", data: videoGame });
});

//?UPDATE VIDEO GAME BY ID
exports.updateVideoGame = catchAsync(async (req, res, next) => {
  const { videoGame } = req;
  const { serialNumber } = req.body;

  if (serialNumber) {
    //Check that it is not repeated by the serial number
    //SELECT * FROM videoGame WHERE status = "active" AND serialNumber = serialNumber AND id != videoGame.id
    const existVideoGame = await VideoGame.findAll({
      where: {
        status: "active",
        serialNumber,
        id: { [Op.ne]: videoGame.id },
      },
    });

    if (existVideoGame.length > 0) {
      return next(
        new AppError(
          404,
          `The videoGameConsole with serial number: ${serialNumber} is already registered`,
          1
        )
      );
    }
  }
  //Update Image
  if (req.file) {
    const imgRef = ref(storage, videoGame.imgUrl);
    const result = await uploadBytes(imgRef, req.file.buffer);
  }

  const data = filterObj(
    req.body,
    "nameId",
    "modelId",
    "color",
    "serialNumber",
    "hardHDD",
    "stateId"
  );

  await videoGame.update({ ...data });

  res.status(200).json({ status: "success" });
});

//?DELETE VIDEO GAME BY ID
exports.deleteVideoGame = catchAsync(async (req, res, next) => {
  const { videoGame } = req;

  videoGame.update({ status: "delete" });

  res.status(200).json({ status: "success" });
});
