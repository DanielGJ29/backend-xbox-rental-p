const express = require("express");

//Controllers
const { createDocument } = require("../controllers/documents.controller");

//Utils
const { upload } = require("../util/multer");

const router = express.Router();

const cpUpload = upload.fields([
  { name: "docIneFront", maxCount: 1 },
  { name: "docIneReverse", maxCount: 1 },
]);

router.post("/", cpUpload, createDocument);

module.exports = { documentRouter: router };
