const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { Op } = require("sequelize");

//Utils
const { catchAsync } = require("../util/catchAsync");
const { storage } = require("../util/firebase");
const { AppError } = require("../util/appError");
const { filterObj } = require("../util/filterObj");

//Models
const { Accessory } = require("../Models/accessories.model");

//?NEW ACCESORY
exports.createAccessory = catchAsync(async (req, res, next) => {
  const { name, model, color, serialNumber, characteristics, rentalPrice } =
    req.body;
  const { currentUser } = req;

  const accesory = await Accessory.findOne({
    where: { status: "active", serialNumber },
  });

  if (accesory) {
    return next(
      new AppError(
        404,
        `The Accesory with serial number: ${serialNumber} is already registered`,
        1
      )
    );
  }

  // Upload file
  let countId = 0;
  const accessories = await Accessory.findAll();
  if (accessories.length > 0) {
    countId = accessories.length + 1;
  } else {
    countId = 1;
  }

  const imgRef = ref(
    storage,
    `Accesories img/${countId}-${Date.now()}-${req.file.originalname}`
  );
  const result = await uploadBytes(imgRef, req.file.buffer);
  const imgDownloadUrl = await getDownloadURL(imgRef);

  //Query create
  const newAccessory = await Accessory.create({
    name,
    model,
    color,
    serialNumber,
    characteristics,
    rentalPrice,
    imgUrl: result.metadata.fullPath,
    userId: currentUser.id,
  });

  newAccessory.imgUrl = imgDownloadUrl;

  res.status(200).json({ status: "success", data: newAccessory });
});

//?GET ALL ACCESSORY
exports.getAllAccessory = catchAsync(async (req, res, next) => {
  const accessories = await Accessory.findAll({ where: { status: "active" } });

  //dowload img
  const accessoriesPromises = accessories.map(async (item) => {
    const imgRef = ref(storage, item.imgUrl);
    const imgDownloadUrl = await getDownloadURL(imgRef);
    item.imgUrl = imgDownloadUrl;
    return item;
  });

  const resolveAccessories = await Promise.all(accessoriesPromises);

  res.status(200).json({ status: "success", data: resolveAccessories });
});

//?GET ACCESSORY BY ID
exports.getAccessoryById = catchAsync(async (req, res, next) => {
  const { accessory } = req;

  //dowload img
  const imgRef = ref(storage, accessory.imgUrl);
  const imgDownloadUrl = await getDownloadURL(imgRef);
  accessory.imgUrl = imgDownloadUrl;

  res.status(200).json({ status: "success", data: accessory });
});

//?UPDATE ACCESSORY BY ID
exports.updateAccessory = catchAsync(async (req, res, next) => {
  const { accessory } = req;
  const { serialNumber } = req.body;

  //Check that it is not repeated by the serial number
  //SELECT * FROM videoGame WHERE status = "active" AND serialNumber = serialNumber AND id != videoGame.id
  if (serialNumber) {
    const existAccessory = await Accessory.findAll({
      where: {
        status: "active",
        serialNumber,
        id: { [Op.ne]: accessory.id },
      },
    });

    if (existAccessory.length > 0) {
      return next(
        new AppError(
          404,
          `The accessory with serial number: ${serialNumber} is already registered`,
          1
        )
      );
    }
  }

  //Update Image
  if (req.file) {
    const imgRef = ref(storage, accessory.imgUrl);
    const result = await uploadBytes(imgRef, req.file.buffer);
  }

  const data = filterObj(
    req.body,
    "name",
    "model",
    "color",
    "serialNumber",
    "characteristics",
    "rentalPrice",
    "stateId"
  );

  await accessory.update({ ...data });

  res.status(200).json({ status: "success" });
});

//?DELETE GAMEPAD BY ID
exports.deleteAccessory = catchAsync(async (req, res, next) => {
  const { accessory } = req;

  accessory.update({ status: "delete" });

  res.status(200).json({ status: "success" });
});
