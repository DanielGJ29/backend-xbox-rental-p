const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

//Models
const { Client } = require("../Models/client.model");
const { Documents } = require("../Models/documents");

//Utils
const { catchAsync } = require("../util/catchAsync");
const { storage } = require("../util/firebase");
const { AppError } = require("../util/appError");
const { filterObj } = require("../util/filterObj");

//?CREATE CLIENT
exports.createClient = catchAsync(async (req, res, next) => {
  const {
    name,
    lastName,
    motherLastName,
    phone,
    email,
    socialNetworkId,
    street,
    numberInt,
    numberOut,
    colony,
    zipCode,
    city,
    municipality,
    state,
  } = req.body;

  const clients = await Client.findOne({
    where: { status: "active", email },
  });

  if (clients) {
    return next(new AppError(404, `The email: ${email} is already registered`));
  }

  //Upload file
  let countId = 0;
  const client = await Client.findAll();
  if (client.length > 0) {
    countId = client.length + 1;
  } else {
    countId = 1;
  }
  const imgRefAvatar = ref(
    storage,
    `Client img/${countId}-${Date.now()}-${req.files.avatarUrl[0].originalname}`
  );
  const imgRefDocIneFront = ref(
    storage,
    `ClientDocs/${countId}-ineFront-${Date.now()}-${
      req.files.docIneFront[0].originalname
    }`
  );
  const imgRefDocIneReverse = ref(
    storage,
    `ClientDocs/${countId}-ineReverse-${Date.now()}-${
      req.files.docIneReverse[0].originalname
    }`
  );

  const resultAvatar = await uploadBytes(
    imgRefAvatar,
    req.files.avatarUrl[0].buffer
  );

  const resultDocIneFront = await uploadBytes(
    imgRefDocIneFront,
    req.files.docIneFront[0].buffer
  );
  const resultDocIneReverse = await uploadBytes(
    imgRefDocIneReverse,
    req.files.docIneReverse[0].buffer
  );

  const imgDownloadUrlAvatar = await getDownloadURL(imgRefAvatar);
  const imgDownloadUrlDocIneFront = await getDownloadURL(imgRefDocIneFront);
  const imgDownloadUrlDocIneReverse = await getDownloadURL(imgRefDocIneReverse);
  //end Upload imgs

  const newClient = await Client.create({
    name,
    lastName,
    motherLastName,
    phone,
    email,
    socialNetworkId,
    street,
    numberInt,
    numberOut,
    colony,
    zipCode,
    city,
    municipality,
    state,
    avatarUrl: resultAvatar.metadata.fullPath,
    //docId: newDocument.id,
  });

  //Save files  in the table documents by ID of CLients
  const newDocument = await Documents.create({
    clientId: newClient.id,
    docIneFront: resultDocIneFront.metadata.fullPath,
    docIneReverse: resultDocIneReverse.metadata.fullPath,
  });

  newClient.avatarUrl = imgDownloadUrlAvatar;

  res.status(200).json({ status: "success", data: newClient });
});

//?GET ALL CLIENTS
exports.getAllClients = catchAsync(async (req, res, next) => {
  const clients = await Client.findAll({
    where: { status: "active" },
    include: [{ model: Documents }],
  });

  //dowload url img
  const userPromises = clients.map(async (client) => {
    const imgRef = ref(storage, client.avatarUrl);
    const imgDownloadUrl = await getDownloadURL(imgRef);
    client.avatarUrl = imgDownloadUrl;

    //dowload img docuemnts
    await Promise.all(
      client.documents.map(async (doc) => {
        const imgRefIneFront = ref(storage, doc.docIneFront);
        const imgRefIneReverse = ref(storage, doc.docIneReverse);
        const imgDownloadUrlIneFront = await getDownloadURL(imgRefIneFront);
        const imgDownloadUrlIneReverse = await getDownloadURL(imgRefIneReverse);
        doc.docIneFront = imgDownloadUrlIneFront;
        doc.docIneReverse = imgDownloadUrlIneReverse;
      })
    );
    return client;
  });

  const resolveClients = await Promise.all(userPromises);

  res.status(200).json({ status: "success", data: resolveClients });
});

//?GET CLIENT BY ID
exports.getClientById = catchAsync(async (req, res, next) => {
  const { client } = req;

  //Dowload Url avatar
  const imgRef = ref(storage, client.avatarUrl);
  const imgDownloadUrl = await getDownloadURL(imgRef);

  //Dowload url documents
  const documentPromises = client.documents.map(async (doc) => {
    const imgRefIneFront = ref(storage, doc.docIneFront);
    const imgRefIneReverse = ref(storage, doc.docIneReverse);
    const imgDowloadUrlIneFront = await getDownloadURL(imgRefIneFront);
    const imgDowloadUrlIneReverse = await getDownloadURL(imgRefIneReverse);
    doc.docIneFront = imgDowloadUrlIneFront;
    doc.docIneReverse = imgDowloadUrlIneReverse;
  });

  const resolveClients = await Promise.all(documentPromises);

  client.avatarUrl = imgDownloadUrl;

  res.status(200).json({ status: "success", data: client });
});

//?UPDATE CLIENT
exports.updateClient = catchAsync(async (req, res, next) => {
  const { client } = req;

  if (req.files) {
    const filterDoc = filterObj(
      req.files,
      "avatarUrl",
      "docIneFront",
      "docIneReverse"
    );

    for (const key in filterDoc) {
      const imgBuffer = filterDoc[key][0].buffer;
      const fieldName = filterDoc[key][0].fieldname;

      if (fieldName === "avatarUrl") {
        const imgRef = ref(storage, client.avatarUrl);
        const result = await uploadBytes(imgRef, imgBuffer);
      } else {
        const imgRef = ref(storage, client.documents[0][fieldName]);
        const result = await uploadBytes(imgRef, imgBuffer);
      }
    }
  }

  const data = filterObj(
    req.body,
    "name",
    "lastName",
    "motherLastName",
    "phone",
    "email",
    "socialNetworkId",
    "street",
    "numberInt",
    "numberOut",
    "colony",
    "zipCode",
    "city",
    "municipality",
    "state"
  );

  await client.update({ ...data });

  res.status(200).json({ status: "success" });
});

//?DELETE CLIENT BY ID
exports.deleteClient = catchAsync(async (req, res, next) => {
  const { client } = req;

  client.update({ status: "delete" });

  res.status(200).json({ status: "success" });
});
