const { Op } = require("sequelize");

//Utils
const { catchAsync } = require("../../util/catchAsync");
const { AppError } = require("../../util/appError");
const { filterObj } = require("../../util/filterObj");

//Models
const { VideoGameName } = require("./videoGameName.model");

//?NEW VIDEO GAME NAME
exports.createVideoGameName = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new AppError(400, "Name is required"));
  }

  const videoGameName = await VideoGameName.findOne({
    where: { name },
  });

  if (videoGameName) {
    return next(
      new AppError(
        404,
        `The videoGameName with name: ${name} is already registered with ID ${videoGameName.id}`,
        "05"
      )
    );
  }

  //Query create
  const newVideoGameName = await VideoGameName.create({
    name,
  });
  res.status(200).json({ status: "success", data: newVideoGameName });
});

//?GET ALL VIDEO GAME NAME
exports.getAllVideoGameName = catchAsync(async (req, res, next) => {
  const videoGameName = await VideoGameName.findAll({
    where: { status: "active" },
  });

  res.status(200).json({ status: "success", data: videoGameName });
});

//?GET VIDEO GAME BY ID
exports.getVideoGameNameById = catchAsync(async (req, res, next) => {
  const { videoGameName } = req;

  res.status(200).json({ status: "success", data: videoGameName });
});

//?UPDATE VIDEO GAME BY ID
exports.updateVideoGameName = catchAsync(async (req, res, next) => {
  const { videoGameName } = req;
  const { name } = req.body;

  if (name) {
    //Check that it is not repeated by name
    //SELECT * FROM videoGame WHERE status = "active" AND name = name AND id != videoGameName.id
    const existVideoGameName = await VideoGameName.findAll({
      where: {
        status: "active",
        name,
        id: { [Op.ne]: videoGameName.id },
      },
    });

    if (existVideoGameName.length > 0) {
      return next(
        new AppError(
          404,
          `The videoGameName with name: ${name} is already registered`,
          1
        )
      );
    }
  }

  const data = filterObj(req.body, "name");

  await videoGameName.update({ ...data });

  res.status(200).json({ status: "success" });
});

//?DELETE VIDEO GAME BY ID
exports.deleteVideoGameName = catchAsync(async (req, res, next) => {
  const { videoGameName } = req;

  videoGameName.update({ status: "delete" });

  res.status(200).json({ status: "success" });
});

//?ACTIVE VIDEO GAME BY ID
exports.activeVideoGameName = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  //Check if the game exists with the id
  const videoGameName = await VideoGameName.findOne({
    where: { status: "delete", id },
  });

  if (!videoGameName) {
    return next(
      new AppError(
        404,
        "video Game console with Id not found or it's active",
        "06"
      )
    );
  }

  videoGameName.update({ status: "active" });

  res.status(200).json({ status: "success" });
});
