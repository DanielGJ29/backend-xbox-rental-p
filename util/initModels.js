const { DataTypes } = require("sequelize");
const { Client } = require("../apiServices/clients/client.model");
const { Documents } = require("../apiServices/documents/documents");
const { VideoGame } = require("../apiServices/videoGames/videoGame.model.js");
const {
  VideoGameName,
} = require("../apiServices/videoGameName/videoGameName.model.js");
const {
  VideoGameModel,
} = require("../apiServices/videoGameModel/videoGameModel.model");
const { Gamepad } = require("../apiServices/gamepads/gamepad.model");

const { Cart } = require("../apiServices/carts/cart.model");
const { ProductInCart } = require("../Models/productInCart.model");
const { Product } = require("../Models/product.model");

const initModels = () => {
  // 1 client <--> M documents
  Client.hasMany(Documents);
  Documents.belongsTo(Client);

  //1 videoGameName <--> M videogame
  //VideoGameName.hasMany(VideoGame, { foreignKey: { type: DataTypes.UUID } });
  // VideoGameName.hasMany(VideoGame, { foreignKey: "nameId" });
  // VideoGame.belongsTo(VideoGameName, { foreignKey: "nameId" });

  // 1 videoGameModel <--> M videoGame
  // VideoGameModel.hasMany(VideoGame, { foreignKey: "modelId" });
  // VideoGame.belongsTo(VideoGameModel, { foreignKey: "modelId" });

  // videogameName 1 <--> M Gamepad
  // VideoGameName.hasMany(Gamepad);
  // Gamepad.belongsTo(VideoGameName);

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
