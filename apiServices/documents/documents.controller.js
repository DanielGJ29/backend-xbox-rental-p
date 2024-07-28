const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

//Model
const { Documents } = require("./documents");
const { Client } = require("../clients/client.model");

//utils
const { catchAsync } = require("../../util/catchAsync");
const { storage } = require("../../util/firebase");

//?CREATE NEW DOCUMENT
exports.createDocument = catchAsync(async (req, res, next) => {
  let countId;
  const client = await Client.findAll();
  if (client.length > 0) {
    countId = client.length + 1;
  } else {
    countId = 1;
  }

  //Upload file
  const imgRefDocIneFront = ref(
    storage,
    `ClientDocs/${countId}-${Date.now()}-${
      req.files.docIneFront[0].originalname
    }`
  );
  const imgRefDocIneReverse = ref(
    storage,
    `ClientDocs/${countId}-${Date.now()}-${
      req.files.docIneReverse[0].originalname
    }`
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
