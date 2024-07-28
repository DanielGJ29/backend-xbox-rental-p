//Model
const { VideoGame } = require("../apiServices/videoGames/videoGame.model");
const {
  VideoGameName,
} = require("../apiServices/videoGameName/videoGameName.model");
const {
  VideoGameModel,
} = require("../apiServices/videoGameModel/videoGameModel.model");

//Util
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");

exports.videoGameExist = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  //Check if the game exists with the id
  const videoGame = await VideoGame.findOne({
    where: { status: "active", id },
    // attributes: { exclude: ["nameId", "modelId"] },
    include: [VideoGameName, VideoGameModel],
  });

  if (!videoGame) {
    return next(new AppError(404, "video Game console with Id not found"));
  }

  req.videoGame = videoGame;

  next();
});
