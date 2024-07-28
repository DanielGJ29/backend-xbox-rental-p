//Model
const { Client } = require("../apiServices/clients/client.model");
const { Documents } = require("../apiServices/documents/documents");

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

exports.converterToLowerCase = catchAsync(async (req, res, next) => {
  req.body.name = req.body.name.toLowerCase();
  req.body.lastName = req.body.lastName.toLowerCase();
  req.body.motherLastName = req.body.motherLastName.toLowerCase();
  // phone: '1234567899',
  req.body.email = req.body.email.toLowerCase();
  //socialNetworkId: '1',
  req.body.linkSocialNetwork = req.body.linkSocialNetwork.toLowerCase();
  req.body.street = req.body.street.toLowerCase();

  // numberOut: '3',
  req.body.colony = req.body.colony.toLowerCase();
  // zipCode: '97314',
  req.body.city = req.body.city.toLowerCase();
  req.body.municipality = req.body.municipality.toLowerCase();
  req.body.state = req.body.state.toLowerCase();

  next();
});
