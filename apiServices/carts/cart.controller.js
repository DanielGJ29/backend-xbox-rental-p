//Utisl
const { sequelize } = require("../../util/database");
const { AppError } = require("../../util/appError");
const { catchAsync } = require("../../util/catchAsync");

const { QueryTypes, Op } = require("sequelize");

//Models
const { Cart } = require("./cart.model");
const { VideoGame } = require("../videoGame/videoGame.model");
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

  // const IsRentedCart = await Cart.findOne({
  //   where: {
  //     [Op.or]: [{ status: "rented" }],
  //     clientId: client.id,
  //   },
  // });

  // if (IsRentedCart) {

  //   res.status(202).json({
  //     status: "success",
  //     data: { message: "This Client has a rented cart" },
  //   });
  //   return;
  // }

  const cart = await Cart.findOne({
    where: {
      [Op.or]: [{ status: "active" }, { status: "rented" }],
      clientId: client.id,
    },
    include: [
      {
        model: Product,
        through: {
          where: { [Op.or]: [{ status: "active" }, { status: "rented" }] },
        },
        // attributes: { exclude: ["productInCart"] },
      },
    ],
  });

  if (!cart) {
    return next(
      new AppError(
        200,
        "Este cliente no cuenta con productos pendiente. / This Client does not have a cart yet"
      )
    );
    // res.status(200).json({
    //   status: "success",
    //   data: { message: "This Client does not have a cart yet", cart: [], products:{videoGame} },
    //   // message: "This Client does not have a cart yet",
    // });
    // return;
  }

  //firter by type artcicle
  const videoGamesId = [];
  const gamepadId = [];
  const accessoryId = [];
  let subtotalVideogame = 0;
  let subtotalGamepad = 0;
  let subtotalAccessory = 0;
  const fullCart = {
    cart: cart,
    products: { videoGames: [], gamepads: [], accessories: [] },
    totales: { subtotal: 0, descuento: 0, control: 50, total: 0 },
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

    subtotalVideogame = videoGames.reduce(
      (accumulator, currentValue) =>
        accumulator.rentalPrice + currentValue.rentalPrice,
      { rentalPrice: 0 }
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

    subtotalGamepad = gamepads.length * 50;

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

    // const subtotal = accessories.reduce(
    //   (accumulator, currentValue) =>
    //     accumulator.rentalPrice + currentValue.rentalPrice,
    //   { rentalPrice: 0 }
    // );

    let count = 0;
    accessories.map((item) => {
      count = count + item.rentalPrice;
    });
    subtotalAccessory = count;

    fullCart.products.accessories = accessories;
  }

  //Totales

  const subtotal = subtotalVideogame + subtotalGamepad + subtotalAccessory;
  // const total =
  //   subtotal - (fullCart.totales.descuento + fullCart.totales.control);
  const total = subtotal - fullCart.totales.descuento;
  fullCart.totales.subtotal = subtotal;
  fullCart.totales.total = total;

  res.status(200).json({ status: "success", data: fullCart });
});

//?ADD PRODUCT TO CART
exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const { productId, clientId, quantity } = req.body;

  if (productId.articleType < 1 || productId.articleType > 3) {
    return next(
      new AppError(400, "Tipo de articulo no permitido use (1 2, o 3)")
    );
  }

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
      where: { status: "active", id: productId.id, available: true },
    });

    if (!product) {
      res.status(200).json({
        status: "fail",
        message: `consola con id: ${productId.id} no disponible`,
      });
      return;
    }
  }

  if (productId.articleType === 2) {
    const product = await Gamepad.findOne({
      where: { status: "active", id: productId.id, available: true },
    });

    if (!product) {
      res.status(200).json({
        status: "fail",
        message: `consola con id: ${productId.id} no disponible`,
      });
      return;
    }
  }

  if (productId.articleType === 3) {
    const product = await Accessory.findOne({
      where: { status: "active", id: productId.id, available: true },
    });

    if (!product) {
      res.status(200).json({
        status: "fail",
        message: `consola con id: ${productId.id} no disponible`,
      });
      return;
    }
  }

  //? Check if client's cart is active, if not, create one
  const cart = await Cart.findOne({
    where: { status: "active", clientId: clientId },
  });

  //?Check if Article exist in the Cart that belongs to the client
  // select c.id, c."userId", c."clientId",  c.status, pc."productId", p."articleType", p."articleId" from "carts" c
  // left join "productInCarts" pc on pc."cartId" = c."id"
  // left join "products" p on p."id" = pc."productId"
  // where "articleType" = 1 and "articleId" = 2 and "clientId" = 1
  const productExiste = await Cart.findAll({
    where: {
      clientId: clientId,
    },
    include: [
      {
        model: Product,
        where: {
          articleId: productId.id,
          articleType: productId.articleType,
        },
      },
    ],
  });

  if (productExiste.length > 0) {
    res.status(200).json({
      status: "success",
      message: `Articulo con id: ${productId.id} ya existe en el carrito`,
    });
    return;
  }

  //?Fill the Product table  with videogame items, gamepad or accessory
  const newProduct = await Product.create({
    articleType: productId.articleType,
    articleId: productId.id,
    quantity: 1,
  });

  if (!cart) {
    //CREATE NEW cART
    const newCart = await Cart.create({
      clientId: clientId,
      userId: currentUser.id,
    });

    await ProductInCart.create({
      cartId: newCart.id,
      productId: newProduct.id,
      quantity: 1,
    });

    res.status(200).json({ status: "success" });
    return;
  }

  // Add new product to cart
  await ProductInCart.create({
    cartId: cart.id,
    productId: newProduct.id,
    quantity: 1,
  });

  res.status(200).json({ status: "success" });
});

//?ADD PRODUCT TO CART MULTILPLE
exports.addProductToCartMultiple = catchAsync(async (req, res, next) => {
  const { currentUser } = req;
  const { productId, clientId, quantity } = req.body;

  if (productId.articleType < 1 || productId.articleType > 3) {
    return next(
      new AppError(400, "Tipo de articulo no permitido use (1 2, o 3)")
    );
  }

  //check client is exist
  const client = await Client.findOne({
    where: { status: "active", id: clientId },
  });

  if (!client) {
    return next(new AppError(400, "Client is not exist"));
  }

  // Check if product to add, is available
  let productAvailable;
  if (productId.articleType === 1) {
    const product = await VideoGame.findAll({
      where: { status: "active", id: productId.id, available: true },
    });

    if (product.length === 0) {
      res.status(200).json({
        status: "fail",
        message: `consola con id: ${productId.id} no encontrado`,
      });
      return;
    }
    productAvailable = product;
  }

  if (productId.articleType === 2) {
    const product = await Gamepad.findAll({
      where: { status: "active", id: productId.id, available: true },
    });

    if (product.length === 0) {
      res.status(200).json({
        status: "fail",
        message: `Control con id: ${productId.id} no encontrado`,
      });
      return;
    }
    productAvailable = product;
  }

  if (productId.articleType === 3) {
    const product = await Accessory.findAll({
      where: { status: "active", id: productId.id, available: true },
    });

    if (product.length === 0) {
      res.status(200).json({
        status: "fail",
        message: `Accesorio con id: ${productId.id} no encontrado`,
      });
      return;
    }
    productAvailable = product;
  }

  //? Check if client's cart is active, if not, create one
  const cart = await Cart.findOne({
    where: { status: "active", clientId: clientId },
  });

  //?Check if Article exist in the Cart that belongs to the client
  // select c.id, c."userId", c."clientId",  c.status, pc."productId", p."articleType", p."articleId" from "carts" c
  // left join "productInCarts" pc on pc."cartId" = c."id"
  // left join "products" p on p."id" = pc."productId"
  // where "articleType" = 1 and "articleId" = 2 and "clientId" = 1

  const productExiste = await Cart.findAll({
    where: {
      clientId: clientId,
    },
    include: [
      {
        model: Product,
        where: {
          articleId: productId.id,
          articleType: productId.articleType,
        },
      },
    ],
  });

  const idsRepetidos = productExiste.map((item) => item.articleId);
  const availablesIds = productAvailable.map((item) => item.id);

  const noRepetidos = availablesIds.filter((id) =>
    idsRepetidos.includes(id) ? "" : id
  );

  // res.status(200).json({
  //   status: "success",
  //   message: `Articulo con id: ${idsRepetidos} ya existe en el carrito, no repetidos ${noRepetidos}`,
  // });
  // return;

  if (noRepetidos.length === 0) {
    res.status(200).json({
      status: "success",
      message: [`Articulos con id: ${idsRepetidos}, previamente agregado`],
    });
    return;
  }

  //?Fill the Product table  with videogame items, gamepad or accessory

  const createBulk = noRepetidos.map((item) => {
    return {
      articleId: item,
      articleType: productId.articleType,
      quantity: 1,
    };
  });

  const newProduct = await Product.bulkCreate(createBulk);

  if (!cart) {
    //CREATE NEW cART
    const newCart = await Cart.create({
      clientId: clientId,
      userId: currentUser.id,
    });

    const createBulkBYProductInCart = newProduct.map((item) => {
      return {
        cartId: newCart.id,
        productId: item.id,
        quantity: 1,
      };
    });

    await ProductInCart.bulkCreate(createBulkBYProductInCart);

    res.status(200).json({
      status: "success",
      message: [
        `Articulo con id: ${noRepetidos} agregados correctamente`,
        `Articulos con id no agregados ${idsRepetidos}`,
      ],
    });
    return;
  }

  // Add new product to cart
  const createBulkBYProductInCart = newProduct.map((item) => {
    return {
      cartId: cart.id,
      productId: item.id,
      quantity: 1,
    };
  });

  await ProductInCart.bulkCreate(createBulkBYProductInCart);

  res.status(200).json({
    status: "success",
    message: [
      `Articulo con id: ${noRepetidos} agregados correctamente`,
      `Articulos con id no agregados ${idsRepetidos}`,
    ],
  });
});

//?DELETE PRODUCT TO CART
exports.deleteProductFromCart = catchAsync(async (req, res, next) => {
  const { productId, clientId, articleType } = req.body;
  const { currentUser } = req;

  //Check is cart exist
  const card = await Cart.findOne({
    where: { status: "active", clientId: clientId },
    include: [{ model: Product, through: { where: { status: "active" } } }],
  });

  if (!card) {
    return next(new AppError(400, "This user does not have a cart yet"));
  }

  //search product by id
  // const productExist = await Product.findOne({
  //   where: {
  //     status: "active",
  //     articleType: articleType,
  //     articleId: productId,
  //   },
  // });
  const productExist = await Cart.findOne({
    where: {
      clientId: clientId,
    },
    include: [
      {
        model: Product,
        where: {
          articleId: productId,
          articleType: articleType,
        },
      },
    ],
  });

  if (!productExist) {
    return next(
      new AppError(
        404,
        "This product does not exist in this cart | producto no existe "
      )
    );
  }

  const result = await ProductInCart.destroy({
    where: {
      cartId: card.id,
      productId: productExist.id,
    },
  });

  const result2 = await Product.destroy({
    where: {
      articleType: articleType,
      articleId: productId,
    },
    include: [
      {
        model: ProductInCart,
        where: {
          cartId: card.id,
          productId: productExist.id,
        },
      },
    ],
  });

  res.status(200).json({ status: "success", result });
});

//?RENTED CART
exports.rentedCart = catchAsync(async (req, res, next) => {
  const { clientId, endDate, startDate, pay, change } = req.body;
  const { currentUser } = req;

  // console.log("startDate", startDate);
  // console.log("endDate", endDate);

  // const days = startDate- endDate

  // res.status(200).json({ success: "success" });
  // return;

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

  // Update all products as Rented
  const arrayPrice = [];
  const cartPromises = cartExist.products.map(async (product) => {
    await product.productInCart.update({ status: "rented" });

    //Update status VIDEOGAMES
    if (product.articleType === 1) {
      await VideoGame.update(
        { available: false },
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
        { available: false },
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
        { available: false },
        { where: { id: product.articleId } }
      );

      const accessory = await Accessory.findOne({
        where: { status: "active", id: product.articleId },
      });

      if (accessory) arrayPrice.push(accessory.rentalPrice);
    }

    return await product.update({ status: "rented" });
  });

  await Promise.all(cartPromises);

  // res.status(200).json({ success: "success", data: arrayPrice });
  const price = arrayPrice.reduce((prev, curr) => prev + curr, 0);

  //Mark cart as purchased
  await cartExist.update({ status: "rented" });

  const newOrder = await Order.create({
    clientId: clientExist.id,
    userId: currentUser.id,
    cartId: cartExist.id,
    startDate: startDate,
    endDate: endDate,
    totalPrice: price,
    rentalDays: 0,
    issuedAt: new Date().toLocaleString(),
  });
  res.status(200).json({ success: "success", data: { newOrder } });
});

//?RETURN ARTICLE
exports.returnArticle = catchAsync(async (req, res, next) => {
  // const { clientId, videoGames, gamepads, accessories } = req.body;
  const { clientId } = req.params;

  //Check Client exist
  const clientExist = await Client.findOne({
    where: { status: "active", id: clientId },
  });

  if (!clientExist) {
    return next(new AppError(404, "Client with id is not exit"));
  }

  //Check Cart exist
  const cartExist = await Cart.findOne({
    where: { status: "rented", clientId: clientId },
    include: [
      {
        model: Product,
        through: { where: { status: "rented" } },
      },
    ],
  });

  if (!cartExist) {
    return next(new AppError(404, "This Client does not have a rental yet"));
  }

  // res.status(200).json({ success: "success", iD: cartExist });
  // return;

  // Update all products as return

  //Update VideoGames
  await sequelize.query(
    `UPDATE "videoGames" set available = 'true' WHERE id IN (
SELECT  v.id FROM carts c
LEFT JOIN "productInCarts" pc on pc."cartId" = c.id
LEFT JOIN "products" p on p."id" = pc."productId"
LEFT JOIN "videoGames" v on v."id" = p."articleId"
WHERE c."clientId" = ${cartExist.clientId} and p."articleType" = 1 and pc.status = 'rented' and p.status = 'rented' and v.available = 'false'
)`,
    {
      type: QueryTypes.UPDATE,
    }
  );

  //Update Gamepads
  await sequelize.query(
    `UPDATE "gamepads" set available = 'true' WHERE id IN (
SELECT  g.id FROM carts c
	LEFT JOIN "productInCarts" pc on pc."cartId" = c.id
	LEFT JOIN "products" p on p."id" = pc."productId"
	LEFT JOIN "gamepads" g on g."id" = p."articleId"
	WHERE c."clientId" = ${cartExist.clientId} and p."articleType" = 2 and pc.status = 'rented' and p.status = 'rented' and g.available = 'false'
)`,
    {
      type: QueryTypes.UPDATE,
    }
  );

  //Update Accessories
  await sequelize.query(
    `UPDATE "accessories" set available = 'true' WHERE id IN (
SELECT  a.id FROM carts c
	LEFT JOIN "productInCarts" pc on pc."cartId" = c.id
	LEFT JOIN "products" p on p."id" = pc."productId"
	LEFT JOIN "accessories" a on a."id" = p."articleId"
	WHERE c."clientId" = ${cartExist.clientId} and p."articleType" = 3 and pc.status = 'rented' and p.status = 'rented' and a.available = 'false'
)`,
    {
      type: QueryTypes.UPDATE,
    }
  );

  const cartPromises = cartExist.products.map(async (product) => {
    await product.productInCart.update({ status: "return" });
    return await product.update({ status: "return" });
  });

  await Promise.all(cartPromises);

  //Mark cart as return
  await cartExist.update({ status: "return" });

  res.status(200).json({ success: "success" });
});
