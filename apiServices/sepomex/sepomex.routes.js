const express = require("express");

//controller
const { sepomexByzipCode } = require("./sepomex.controller");

//Middlewares
const { validateSession } = require("../../middleware/auth.middlewares");

const router = express.Router();

router.get("/:cp", validateSession, sepomexByzipCode);

module.exports = router;
