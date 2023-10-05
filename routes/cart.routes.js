const express = require("express");

//Controllers
const {
  getClientCart,
  addProductToCart,
  deleteProductFromCart,
  purchaseCart,
  returnArticle,
} = require("../controllers/cart.controller");

//Middleware
const { validateSession } = require("../middleware/auth.middlewares");

const router = express.Router();

router.use(validateSession);

router.get("/:clientId", getClientCart);

router.post("/", addProductToCart);

router.delete("/", deleteProductFromCart);

router.post("/purchase", purchaseCart);

router.post("/returnArticle", returnArticle);

module.exports = { cartRouter: router };
