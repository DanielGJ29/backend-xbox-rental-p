//Model
const {
  VideoGameModel,
} = require("../apiServices/videoGameModel/videoGameModel.model");

//Util
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");

exports.videoGameModelExist = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  //Check if the game exists with the id
  const videoGameModel = await VideoGameModel.findOne({
    where: { status: "active", id },
  });

  if (!videoGameModel) {
    return next(new AppError(404, "video Game Model with Id not found", "06"));
  }

  req.videoGameModel = videoGameModel;

  next();
});
