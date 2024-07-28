//Model
const { Accessory } = require("../apiServices/accessories/accessories.model");

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

exports.converterToLowerCase = catchAsync(async (req, res, next) => {
  req.body.name = req.body.name.toLowerCase();
  req.body.model = req.body.model.toLowerCase();
  req.body.color = req.body.color.toLowerCase();
  req.body.serialNumber = req.body.serialNumber.toLowerCase();
  req.body.characteristics = req.body.characteristics.toLowerCase();

  next();
});
