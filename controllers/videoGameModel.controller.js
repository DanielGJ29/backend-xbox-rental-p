const { Op } = require("sequelize");

//Utils
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");
const { filterObj } = require("../util/filterObj");

//Models
const { VideoGameModel } = require("../Models/videoGameModel.model");

//?NEW VIDEO GAME MODEL
exports.createVideoGameModel = catchAsync(async (req, res, next) => {
  const { model, rentalPrice } = req.body;

  const videoGameModel = await VideoGameModel.findOne({
    where: { model },
  });

  if (videoGameModel) {
    return next(
      new AppError(
        404,
        `The videoGameModel with name model: ${model} is already registered with ID ${videoGameModel.id}`,
        "05"
      )
    );
  }

  //Query create
  const newVideoGameModel = await VideoGameModel.create({
    model,
    rentalPrice,
  });
  res.status(200).json({ status: "success", data: newVideoGameModel });
});

//?GET ALL VIDEO GAME MODEL
exports.getAllVideoGameModel = catchAsync(async (req, res, next) => {
  const videoGameModel = await VideoGameModel.findAll({
    where: { status: "active" },
  });

  res.status(200).json({ status: "success", data: videoGameModel });
});

//?GET VIDEO GAME MODEL BY ID
exports.getVideoGameModelById = catchAsync(async (req, res, next) => {
  const { videoGameModel } = req;

  res.status(200).json({ status: "success", data: videoGameModel });
});

//?UPDATE VIDEO GAME MODEL BY ID
exports.updateVideoGameModel = catchAsync(async (req, res, next) => {
  const { videoGameModel } = req;
  const { model } = req.body;

  if (model) {
    //Check that it is not repeated by name
    //SELECT * FROM videoGame WHERE status = "active" AND name = name AND id != videoGameName.id
    const existVideoGameModel = await VideoGameModel.findAll({
      where: {
        status: "active",
        model,
        id: { [Op.ne]: videoGameModel.id },
      },
    });

    if (existVideoGameModel.length > 0) {
      return next(
        new AppError(
          404,
          `The videoGame with model: ${model} is already registered`,
          1
        )
      );
    }
  }

  const data = filterObj(req.body, "model");

  await videoGameModel.update({ ...data });

  res.status(200).json({ status: "success" });
});

//?DELETE VIDEO GAME BY ID
exports.deleteVideoGameModel = catchAsync(async (req, res, next) => {
  const { videoGameModel } = req;

  videoGameModel.update({ status: "delete" });

  res.status(200).json({ status: "success" });
});

//?ACTIVE VIDEO GAME BY ID
exports.activeVideoGameModel = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  //Check if the game exists with the id
  const videoGameModel = await VideoGameModel.findOne({
    where: { status: "delete", id },
  });

  if (!videoGameModel) {
    return next(
      new AppError(
        404,
        "video Game console model with Id not found or it's active",
        "06"
      )
    );
  }

  videoGameModel.update({ status: "active" });

  res.status(200).json({ status: "success" });
});
