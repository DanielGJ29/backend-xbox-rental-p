//Model
const {
  VideoGameName,
} = require("../apiServices/videoGameName/videoGameName.model");

//Util
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");

exports.videoGameNameExist = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  //Check if the game exists with the id
  const videoGameName = await VideoGameName.findOne({
    where: { status: "active", id },
  });

  if (!videoGameName) {
    return next(
      new AppError(404, "video Game console with Id not found", "06")
    );
  }

  req.videoGameName = videoGameName;

  next();
});
