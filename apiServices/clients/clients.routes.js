const express = require("express");

//Controllers
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  searchByKeyword,
  searchByCode,
} = require("./clients.controller");

//Middlewares
const {
  createClientValidators,
  validateResult,
} = require("../../middleware/validators.middleware");
const {
  validateSession,
  protecAdmin,
} = require("../../middleware/auth.middlewares");
const {
  clientExist,
  converterToLowerCase,
} = require("../../middleware/client.middleware");

//Utils
const { upload } = require("../../util/multer");

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
  converterToLowerCase,
  createClient
);

/**
 * @swagger
 * /api/v1/clients:
 *  get:
 *    summary: List all clients
 *    security:
 *      - ApiAuth: []
 *    tags: [Clients]
 *    responses:
 *      200:
 *        description: Get all clients
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Users'
 */
router.get("/", getAllClients);

router.get("/searchByKeyword/:keyword", searchByKeyword);

router.get("/searchByCode/:code", searchByCode);

router.use("/:id", clientExist);

router.get("/:id", getClientById);

router.patch("/:id", cpUpload, converterToLowerCase, updateClient);

router.delete("/:id", protecAdmin, deleteClient);

module.exports = router;
