const express = require("express");

//Controllers
const {
  getClientCart,
  addProductToCart,
  deleteProductFromCart,
  rentedCart,
  returnArticle,
  addProductToCartMultiple,
} = require("./cart.controller");

//Middleware
const { validateSession } = require("../../middleware/auth.middlewares");

const router = express.Router();

router.use(validateSession);

router.get("/:clientId", getClientCart);

router.get("/returnArticle/:clientId", returnArticle);

router.post("/", addProductToCart);

router.post("/addMultiple", addProductToCartMultiple);

router.delete("/", deleteProductFromCart);

router.post("/rented", rentedCart);

module.exports = router;
