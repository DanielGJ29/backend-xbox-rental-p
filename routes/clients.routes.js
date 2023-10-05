const express = require("express");

//Controllers
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/clients.controller");

//Middlewares
const {
  createClientValidators,
  validateResult,
} = require("../middleware/validators.middleware");
const { validateSession } = require("../middleware/auth.middlewares");
const { clientExist } = require("../middleware/client.middleware");

//Utils
const { upload } = require("../util/multer");

const cpUpload = upload.fields([
  { name: "avatarUrl", maxCount: 1 },
  { name: "docIneFront", maxCount: 1 },
  { name: "docIneReverse", maxCount: 1 },
]);

const router = express.Router();

router.use(validateSession);

router.post(
  "/",
  cpUpload,
  createClientValidators,
  validateResult,
  createClient
);

router.get("/", getAllClients);

router.use("/:id", clientExist);

router.get("/:id", getClientById);

router.patch("/:id", cpUpload, updateClient);

router.delete("/:id", deleteClient);

module.exports = { clientRouter: router };
