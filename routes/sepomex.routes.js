const express = require("express");

//controller
const { sepomexByzipCode } = require("../controllers/sepomex.controller");

//Middlewares
const { validateSession } = require("../middleware/auth.middlewares");

const router = express.Router();

router.get("/:cp", validateSession, sepomexByzipCode);

module.exports = { sepomexRouter: router };
