//Utils
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");

//MOdel
const { Sepomex } = require("../Models/sepomex.model");

//Servicio Postal Mexicano
exports.sepomexByzipCode = catchAsync(async (req, res, next) => {
  const { cp } = req.params;

  const sepomex = await Sepomex.findAll({
    where: { zipCode: cp },
  });

  if (!sepomex) {
    return next(new AppError(404, "zip code not found"));
  }

  const arrayColony = sepomex.map((item) => {
    return item.colony;
  });

  response = {
    cp: cp,
    colony: arrayColony,
    municipality: sepomex[0].municipality,
    state: sepomex[0].state,
  };

  res.status(200).json({ status: "success", data: response });
});
