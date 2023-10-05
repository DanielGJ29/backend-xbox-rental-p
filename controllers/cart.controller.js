//Utisl
const { sequelize } = require("../util/database");
const { AppError } = require("../util/appError");
const { catchAsync } = require("../util/catchAsync");

const { QueryTypes, Op } = require("sequelize");

//Models
const { Cart } = require("../Models/cart.model");
const { VideoGame } = require("../Models/videoGame.model");
const { ProductInCart } = require("../Models/productInCart.model");
const { Product } = require("../Models/product.model");
const { Gamepad } = require("../Models/gamepad.model");
const { Accessory } = require("../Models/accessories.model");
const { Client } = require("../Models/client.model");
const { VideoGameName } = require("../Models/videoGameName.model");
const { Order } = require("../Models/order.model");
const { VideoGameModel } = require("../Models/videoGameModel.model");

//GET CLIENT CART
exports.getClientCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const { clientId } = req.params;

  const client = await Client.findOne({
    where: { status: "active", id: clientId },
  });

  if (!client) {
    return next(new AppError(400, "Client is not exist"));
  }

  const cart = await Cart.findOne({
    where: {
      [Op.or]: [{ status: "active" }, { status: "purchased" }],
      clientId: client.id,
    },
    include: [
      {
        model: Product,
        through: {
          where: { [Op.or]: [{ status: "active" }, { status: "purchased" }] },
        },
        // attributes: { exclude: ["productInCart"] },
      },
    ],
  });

  if (!cart) {
    return next(new AppError(404, "This Client does not have a cart yet"));
  }

  //firter by type artcicle
  const videoGamesId = [];
  const gamepadId = [];
  const accessoryId = [];
  const fullCart = {
    cart: cart,
    products: { videoGames: [], gamepads: [], accessories: [] },
  };

  cart.products.map((product) => {
    if (product.articleType === 1) {
      videoGamesId.push(product.articleId);
    }

    if (product.articleType === 2) {
      gamepadId.push(product.articleId);
    }

    if (product.articleType === 3) {
      accessoryId.push(product.articleId);
    }
  });

  if (videoGamesId.length > 0) {
    const videoGames = await sequelize.query(
      `SELECT g.id,n.name, m.model, m."rentalPrice", g.color, g."serialNumber", g."hardHDD",g."imgUrl",g."stateId",g."userId",g."status",g."createdAt",g."updatedAt"  FROM "videoGames" as g
    LEFT JOIN "videoGameNames" as n  ON n.id = g."nameId" 
    LEFT JOIN "videoGameModels" as m  ON m.id = g."modelId"  
    WHERE g.id IN(?) AND g.status = 'active'`,
      {
        //model: VideoGame,
        replacements: [videoGamesId],
        mapToModel: true,
        include: [{ model: VideoGameName }],
        type: QueryTypes.SELECT,
      }
    );

    fullCart.products.videoGames = videoGames;
  }

  if (gamepadId.length > 0) {
    const gamepads = await sequelize.query(
      `SELECT g.id ,n.name,g."color", g."serialNumber", g."connectionType", g."stateId", g."userId", g."status"  FROM "gamepads" as g
    LEFT JOIN "videoGameNames" as n  ON n.id = g."videoGameNameId"
    WHERE g.id IN(?) AND g.status = 'active'`,
      {
        replacements: [gamepadId],
        type: QueryTypes.SELECT,
      }
    );
    fullCart.products.gamepads = gamepads;
  }

  if (accessoryId.length > 0) {
    const accessories = await sequelize.query(
      `SELECT * FROM "accessories" WHERE id IN(?) AND status = 'active'`,
      {
        replacements: [accessoryId],
        type: QueryTypes.SELECT,
      }
    );
    fullCart.products.accessories = accessories;
  }

  res.status(200).json({ status: "success", data: fullCart });
});

//ADD PRODUCT TO CART
exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const { productId, clientId, quantity } = req.body;

  //check client is exist
  const client = await Client.findOne({
    where: { status: "active", id: clientId },
  });

  if (!client) {
    return next(new AppError(400, "Client is not exist"));
  }

  // Check if product to add, is available
  if (productId.articleType === 1) {
    const product = await VideoGame.findOne({
      where: { status: "active", id: productId.id },
    });
    if (product.stateId === 0) {
      return next(new AppError(404, "The videogame is not available"));
    }
  }
  if (productId.articleType === 2) {
    const product = await Gamepad.findOne({
      where: { status: "active", id: productId.id },
    });
    if (product.stateId === 0) {
      return next(new AppError(404, "The gamepad is not available"));
    }
  }

  if (productId.articleType === 3) {
    const product = await Accessory.findOne({
      where: { status: "active", id: productId.id },
    });
    if (product.stateId === 0) {
      return next(new AppError(404, "The gamepad is not available"));
    }
  }

  // Check if client's cart is active, if not, create one
  const cart = await Cart.findOne({
    where: { status: "active", clientId: clientId },
  });

  //Check if Article exist in the table Product with status removed
  const productRemoved = await Product.findOne({
    where: {
      status: "removed",
      quantity: 0,
      articleType: productId.articleType,
      articleId: productId.id,
    },
  });

  let newProduct;
  if (productRemoved) {
    const product = await productRemoved.update({
      status: "active",
      quantity: 1,
    });

    newProduct = product;
  } else {
    //Fill the Product table  with videogame items, gamepad or accessory
    const product = await Product.create({
      articleType: productId.articleType,
      articleId: productId.id,
      quantity,
    });
    newProduct = product;
  }

  if (!cart) {
    //CREATE NEW cART
    const newCart = await Cart.create({ clientId: clientId });

    await ProductInCart.create({
      cartId: newCart.id,
      productId: newProduct.id,
      quantity: quantity,
    });
  } else {
    // Cart already exists
    // Check if product is already in the cart (productInCart)
    const productExist = await ProductInCart.findOne({
      where: { cartId: cart.id, productId: newProduct.id },
    });

    if (productExist && productExist.status === "active") {
      return next(new AppError(400, "the product already exists the cart "));
    }

    // If product is in the cart but was removed before, add it again
    if (
      productExist &&
      productExist.status === "removed" &&
      productExist.quantity === 0
    ) {
      await productExist.update({ status: "active", quantity });
    }

    // Add new product to cart
    if (!productExist) {
      await ProductInCart.create({
        cartId: cart.id,
        productId: newProduct.id,
        quantity,
      });
    }
  }

  res.status(200).json({ status: "success" });
});

//DELETE PRODUCT TO CART
exports.deleteProductFromCart = catchAsync(async (req, res, next) => {
  const { productId, clientId } = req.body;
  const { currentUser } = req;

  //Check is cart exist
  const cart = await Cart.findOne({
    where: { status: "active", clientId: clientId },
    include: [{ model: Product, through: { where: { status: "active" } } }],
  });

  if (!cart) {
    return next(new AppError(400, "This user does not have a cart yet"));
  }

  //search product by id
  const productIdFilter = await Product.findOne({
    where: {
      status: "active",
      articleType: productId.articleType,
      articleId: productId.id,
    },
  });
  //searh productInCart by id
  const productInCart = await ProductInCart.findOne({
    where: { status: "active", cartId: cart.id, productId: productIdFilter.id },
  });

  if (!productInCart) {
    return next(new AppError(404, "This product does not exist in this cart"));
  }

  await productInCart.update({ status: "removed", quantity: 0 });

  await productIdFilter.update({ status: "removed", quantity: 0 });

  res.status(200).json({ status: "success", cart: productInCart });
});

//PURCHASE CART
exports.purchaseCart = catchAsync(async (req, res, next) => {
  const { clientId, endDate, rentalDays } = req.body;
  const { currentUser } = req;

  const clientExist = await Client.findOne({
    where: { status: "active", id: clientId },
  });

  if (!clientExist) {
    return next(new AppError(404, "Client with id is not exit"));
  }

  const cartExist = await Cart.findOne({
    where: { status: "active", clientId: clientId },
    include: [
      {
        model: Product,
        through: { where: { status: "active" } },
      },
    ],
  });

  if (!cartExist) {
    return next(new AppError(404, "This Client does not have a cart yet"));
  }

  // Update all products as purchased
  const arrayPrice = [];
  const cartPromises = cartExist.products.map(async (product) => {
    await product.productInCart.update({ status: "purchased" });

    //Update status VIDEOGAMES
    if (product.articleType === 1) {
      await VideoGame.update(
        { stateId: 0 },
        { where: { id: product.articleId } }
      );

      const videoGame = await VideoGame.findOne({
        where: { status: "active", id: product.articleId },
        include: [VideoGameModel],
      });
      arrayPrice.push(videoGame.videoGameModel.rentalPrice);
    }

    //update status GAMEPADS
    if (product.articleType === 2) {
      await Gamepad.update(
        { stateId: 0 },
        { where: { id: product.articleId } }
      );

      const gamepad = await Gamepad.findOne({
        where: { status: "active", id: product.articleId },
      });

      if (gamepad) arrayPrice.push(50);
    }

    //update status ACCESSORIES
    if (product.articleType === 3) {
      await Accessory.update(
        { stateId: 0 },
        { where: { id: product.articleId } }
      );

      const accessory = await Accessory.findOne({
        where: { status: "active", id: product.articleId },
      });

      if (accessory) arrayPrice.push(accessory.rentalPrice);
    }

    return await product.update({ status: "purchased" });
  });

  await Promise.all(cartPromises);

  // res.status(200).json({ success: "success", data: arrayPrice });
  const price = arrayPrice.reduce((prev, curr) => prev + curr, 0);

  //Mark cart as purchased
  await cartExist.update({ status: "purchased" });

  const newOrder = await Order.create({
    clientId: clientExist.id,
    userId: currentUser.id,
    cartId: cartExist.id,
    startDate: new Date().toLocaleString(),
    endDate: endDate,
    totalPrice: price,
    rentalDays: rentalDays,
    issuedAt: new Date().toLocaleString(),
  });
  res.status(200).json({ success: "success", data: { newOrder } });
});

//RETURN ARTICLE
exports.returnArticle = catchAsync(async (req, res, next) => {
  const { clientId, videoGames, gamepads, accessories } = req.body;

  //Check Client exist
  const clientExist = await Client.findOne({
    where: { status: "active", id: clientId },
  });

  if (!clientExist) {
    return next(new AppError(404, "Client with id is not exit"));
  }

  //Check Cart exist
  const cartExist = await Cart.findOne({
    where: { status: "purchased", clientId: clientId },
    include: [
      {
        model: Product,
        through: { where: { status: "purchased" } },
      },
    ],
  });

  if (!cartExist) {
    return next(new AppError(404, "This Client does not have a rental yet"));
  }

  // Update all products as return
  const cartPromises = cartExist.products.map(async (product) => {
    await product.productInCart.update({ status: "return" });

    //Update status VIDEOGAMES
    if (product.articleType === 1) {
      videoGames.map(async (videogame) => {
        await VideoGame.update(
          { stateId: 1 },
          { where: { id: videogame.articleId } }
        );
      });
    }

    //update status GAMEPADS
    if (product.articleType === 2) {
      gamepads.map(async (gamepad) => {
        await Gamepad.update(
          { stateId: 1 },
          { where: { id: gamepad.articleId } }
        );
      });
    }

    //update status ACCESSORIES
    if (product.articleType === 3) {
      accessories.map(async (accessory) => {
        await Accessory.update(
          { stateId: 1 },
          { where: { id: accessory.articleId } }
        );
      });
    }

    return await product.update({ status: "return" });
  });

  await Promise.all(cartPromises);

  //Mark cart as return
  await cartExist.update({ status: "return" });

  res.status(200).json({ success: "success" });
});
