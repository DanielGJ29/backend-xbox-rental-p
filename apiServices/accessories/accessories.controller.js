const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { Sequelize, Op } = require("sequelize");

//Utils
const { catchAsync } = require("../../util/catchAsync");
const { storage } = require("../../util/firebase");
const { AppError } = require("../../util/appError");
const { filterObj } = require("../../util/filterObj");

//Models
const { Accessory } = require("./accessories.model");

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
  let countId = 1;
  const accessories = await Accessory.max("id");
  if (accessories) {
    countId = accessories + 1;
  }

  const imgRef = ref(
    storage,
    `Accesories img/${countId}-${Date.now()}-accessory`
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

//?SEARCH BY KEYWORD
exports.searchByKeyword = catchAsync(async (req, res, next) => {
  const { keyword } = req.params;

  //select c.* from clients c where concat(c.id, c.name, ' ',c."lastName",' ',c."motherLastName") ilike concat('%','s','%') and c.status = 'active'
  const accessory = await Accessory.findAll({
    where: {
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn(
            "concat",
            Sequelize.col("id"),
            " ",
            Sequelize.col("name"),
            " ",
            Sequelize.col("model"),
            " ",
            Sequelize.col("serialNumber")
          ),
          {
            [Op.like]: `%${keyword}%`,
          }
        ),

        { status: "active" },
      ],
    },
  });

  if (accessory.length > 0) {
    //dowload url img
    const accessoriesPromises = accessory.map(async (item) => {
      let imgDownloadUrl;
      const imgRef = ref(storage, item.imgUrl);

      imgDownloadUrl = await getDownloadURL(imgRef)
        .then((url) => {
          // Insert url into an <img> tag to "download"
          return url;
        })
        .catch((error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/object-not-found":
              // File doesn't exist
              console.log("File doesn't exist");
              return null;
            case "storage/unauthorized":
              // User doesn't have permission to access the object
              console.log("User doesn't have permission to access the object");
              break;
            case "storage/canceled":
              // User canceled the upload
              console.log("User canceled the upload");
              break;

            // ...

            case "storage/unknown":
              // Unknown error occurred, inspect the server response
              break;
          }
        });
      item.imgUrl = imgDownloadUrl;

      return item;
    });

    const resolveAccessory = await Promise.all(accessoriesPromises);

    res.status(200).json({ status: "success", data: resolveAccessory });
    return;
  }

  res.status(200).json({ status: "success", data: accessory });
});
