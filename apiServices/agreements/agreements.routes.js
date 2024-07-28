const express = require("express");

//Controllers
const { newAgrement } = require("./agreements.controller");

//Middleware
const { validateSession } = require("../../middleware/auth.middlewares");

const router = express.Router();

//router.use(validateSession);

router.get("/", newAgrement);

module.exports = router;
