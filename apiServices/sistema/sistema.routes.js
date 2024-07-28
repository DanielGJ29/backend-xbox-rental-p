const express = require("express");

const { getAllRole, newRole, getAllRutas } = require("./sistema.controller");

//Middleware
const {
  validateSession,
  protecAdmin,
} = require("../../middleware/auth.middlewares");

const router = express.Router();

router.use(validateSession);
router.get("/menu", getAllRutas);
router.get("/roles", protecAdmin, getAllRole);
router.post("/roles", protecAdmin, newRole);

module.exports = router;
