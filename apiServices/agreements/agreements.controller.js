//Utisl
const { sequelize } = require("../../util/database");
const { AppError } = require("../../util/appError");
const { catchAsync } = require("../../util/catchAsync");
const { buildPDF } = require("../../util/pdfKit.js");

const { QueryTypes, Op } = require("sequelize");

//Models
const { Cart } = require("../carts/cart.model");
const { VideoGame } = require("../videoGame/videoGame.model.js");
const { ProductInCart } = require("../../Models/productInCart.model");
const { Product } = require("../../Models/product.model");
const { Gamepad } = require("../../apiServices/gamepads/gamepad.model");
const {
  Accessory,
} = require("../../apiServices/accessories/accessories.model");
const { Client } = require("../../apiServices/clients/client.model");
const {
  VideoGameName,
} = require("../../apiServices/videoGameName/videoGameName.model");
const { Order } = require("../../Models/order.model");
const {
  VideoGameModel,
} = require("../../apiServices/videoGameModel/videoGameModel.model");

//const { PDFDocument } = require("pdfkit");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { getUrl } = require("../../util/dowloadUrl.js");

//?CREATE AGREMENT
exports.newAgrement = catchAsync(async (req, res, next) => {
  // const { currentUser } = req;
  // const { clientId, endDate } = req.body;

  //const doc = new PDFDocument();

  const stream = res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=prueba.pdf",
  });

  buildPDF(
    (data) => stream.write(data),
    () => stream.end()
  );

  //res.status(200).json({ status: "success", data: clientId });
});
