const { DataTypes } = require("sequelize");
const { Client } = require("../Models/client.model");
const { Documents } = require("../Models/documents");
const { VideoGame } = require("../Models/videoGame.model");
const { VideoGameName } = require("../Models/videoGameName.model");
const { VideoGameModel } = require("../Models/videoGameModel.model");
const { Gamepad } = require("../Models/gamepad.model");

const { Cart } = require("../Models/cart.model");
const { ProductInCart } = require("../Models/productInCart.model");
const { Product } = require("../Models/product.model");

const initModels = () => {
  // 1 client <--> M documents
  Client.hasMany(Documents);
  Documents.belongsTo(Client);

  //1 videoGameName <--> M videogame
  //VideoGameName.hasMany(VideoGame, { foreignKey: { type: DataTypes.UUID } });
  VideoGameName.hasMany(VideoGame, { foreignKey: "nameId" });
  VideoGame.belongsTo(VideoGameName, { foreignKey: "nameId" });

  // 1 videoGameModel <--> M videoGame
  VideoGameModel.hasMany(VideoGame, { foreignKey: "modelId" });
  VideoGame.belongsTo(VideoGameModel, { foreignKey: "modelId" });

  // videogameName 1 <--> M Gamepad
  VideoGameName.hasMany(Gamepad);
  Gamepad.belongsTo(VideoGameName);

  //CART
  //M Cart <--> M Product
  Cart.belongsToMany(Product, {
    through: ProductInCart,
    //foreignKey: "productId",
    //sourceKey: "productId",
    //targetKey: "productId",
  });
  Product.belongsToMany(Cart, {
    through: ProductInCart,
    // foreignKey: "productId",
    //targetKey: "productId",
  });
};

module.exports = { initModels };
