//Model
const { Accessory } = require("../Models/accessories.model");

//Util
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");

exports.accessoryExist = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  //Check if the game exists with the id
  const accessory = await Accessory.findOne({
    where: { status: "active", id },
  });

  if (!accessory) {
    return next(new AppError(404, "accessory with Id not found"));
  }

  req.accessory = accessory;

  next();
});
