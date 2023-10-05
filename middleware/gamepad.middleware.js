//Model
const { Gamepad } = require("../Models/gamepad.model");
const { VideoGameName } = require("../Models/videoGameName.model");

//Util
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");

exports.gamepadExist = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  //Check if the game exists with the id
  const gamepad = await Gamepad.findOne({
    where: { status: "active", id },
    attributes: { exclude: ["videoGameNameId"] },
    include: [VideoGameName],
  });

  if (!gamepad) {
    return next(new AppError(404, "Gamepad with Id not found"));
  }

  req.gamepad = gamepad;

  next();
});
