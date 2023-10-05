//Model
const { Client } = require("../Models/client.model");
const { Documents } = require("../Models/documents");

//Util
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");

exports.clientExist = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const client = await Client.findOne({
    where: { status: "active", id },
    include: [{ model: Documents }],
  });

  if (!client) {
    return next(new AppError(404, "client with Id not found"));
  }
  req.client = client;

  next();
});
