const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

//Model
const { Documents } = require("./documents");
const { Client } = require("../clients/client.model");

//utils
const { catchAsync } = require("../../util/catchAsync");
const { storage } = require("../../util/firebase");

//?CREATE NEW DOCUMENT
exports.createDocument = catchAsync(async (req, res, next) => {
  let countId = 1;
  //const client = await Client.findAll();
  const client = await Client.max("id");
  if (client) {
    countId = client + 1;
  }

  //Upload file
  const extIneFront = req.files.docIneFront[0].originalname.split(".")[1];
  const extIneReverse = req.files.docIneReverse[0].originalname.split(".")[1];

  const imgRefDocIneFront = ref(
    storage,
    `portfolio/clientDocs/${countId}-${Date.now()}-INEFront.${extIneFront}`
  );
  const imgRefDocIneReverse = ref(
    storage,
    `portfolio/clientDocs/${countId}-${Date.now()}-INEReverse.${extIneReverse}`
  );

  const resultDocIneFront = await uploadBytes(
    imgRefDocIneFront,
    req.files.docIneFront[0].buffer
  );
  const resultDocIneReverse = await uploadBytes(
    imgRefDocIneReverse,
    req.files.docIneReverse[0].buffer
  );

  const imgDownloadUrlDocIneFront = await getDownloadURL(imgRefDocIneFront);
  const imgDownloadUrlDocIneReverse = await getDownloadURL(imgRefDocIneReverse);

  const newDocument = await Documents.create({
    docIneFront: resultDocIneFront.metadata.fullPath,
    docIneReverse: resultDocIneReverse.metadata.fullPath,
  });

  newDocument.resultDocIneFront = imgDownloadUrlDocIneFront;
  newDocument.resultDocIneReverse = imgDownloadUrlDocIneReverse;

  res.status(200).json({ status: "success", data: newDocument });
});
