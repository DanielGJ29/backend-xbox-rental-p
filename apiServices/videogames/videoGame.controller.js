const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { Sequelize, Op } = require("sequelize");

//Utils
const { catchAsync } = require("../../util/catchAsync");
const { storage } = require("../../util/firebase");
const { AppError } = require("../../util/appError");
const { filterObj } = require("../../util/filterObj");

//Models
const { VideoGame } = require("./videoGame.model");
const { VideoGameName } = require("../videoGameName/videoGameName.model");
const { VideoGameModel } = require("../videoGameModel/videoGameModel.model");

//?NEW VIDEO GAME
exports.createVideoGame = catchAsync(async (req, res, next) => {
  const { nameId, modelId, color, serialNumber, hardHDD } = req.body;
  const { id } = req.currentUser;

  const videoGame = await VideoGame.findOne({
    where: { status: "active", serialNumber },
  });

  if (videoGame) {
    return next(
      new AppError(
        404,
        `The videoGameConsole with serial number: ${serialNumber} is already registered`,
        1
      )
    );
  }

  //Upload file
  let result;
  let imgDownloadUrl;
  if (req.file) {
    let countId = 1;

    const videoGames = await VideoGame.max("id");
    if (videoGames) {
      countId = videoGames + 1;
    }

    const imgRef = ref(storage, `xbox img/ID-${countId}-${Date.now()}-console`);
    result = await uploadBytes(imgRef, req.file.buffer);
    imgDownloadUrl = await getDownloadURL(imgRef);
  }

  //Query create
  const newVideoGame = await VideoGame.create({
    nameId,
    modelId,
    color,
    serialNumber,
    hardHDD,
    imgUrl: req.file ? result.metadata.fullPath : "",
    userId: id,
  });

  if (req.file) {
    newVideoGame.imgUrl = imgDownloadUrl;
  }

  res.status(200).json({ status: "success", data: newVideoGame });
});

//?GET ALL VIDEO GAME
exports.getAllVideoGame = catchAsync(async (req, res, next) => {
  const videoGame = await VideoGame.findAll({
    where: { status: "active" },

    include: [
      {
        model: VideoGameName,
        attributes: ["name"],
      },
      {
        model: VideoGameModel,
        attributes: ["model"],
      },
    ],

    //include: [VideoGameName, VideoGameModel],
    //attributes: { exclude: ["nameId", "modelId"] },
  });

  //dowload img
  const userPromises = videoGame.map(async (item) => {
    let imgDownloadUrl;
    if (item.imgUrl) {
      // Create a storage reference from our storage service
      const imgRef = ref(storage, item.imgUrl);
      console.log("imgRef", imgRef.url);
      const urlStorage = imgRef.url;
      if (urlStorage) {
        imgDownloadUrl = await getDownloadURL(imgRef);
      } else {
        imgDownloadUrl = "";
      }
    }

    item.imgUrl = imgDownloadUrl;
    return item;
  });

  const resolveVideoGame = await Promise.all(userPromises);
  res.status(200).json({ status: "success", data: resolveVideoGame });
});

//?GET VIDEO GAME BY ID
exports.getVideoGameById = catchAsync(async (req, res, next) => {
  const { videoGame } = req;
  //dowload img

  let imgDownloadUrl;
  if (videoGame.imgUrl) {
    // Create a storage reference from our storage service
    const imgRef = ref(storage, videoGame.imgUrl);
    //imgDownloadUrl = await getDownloadURL(imgRef);
    // Get the download URL
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
  }

  videoGame.imgUrl = videoGame.imgUrl ? imgDownloadUrl : "";

  res.status(200).json({ status: "success", data: videoGame });
});

//?UPDATE VIDEO GAME BY ID
exports.updateVideoGame = catchAsync(async (req, res, next) => {
  const { videoGame } = req;
  const { serialNumber } = req.body;

  if (serialNumber) {
    //Check that it is not repeated by the serial number
    //SELECT * FROM videoGame WHERE status = "active" AND serialNumber = serialNumber AND id != videoGame.id
    const existVideoGame = await VideoGame.findAll({
      where: {
        status: "active",
        serialNumber,
        id: { [Op.ne]: videoGame.id },
      },
    });

    if (existVideoGame.length > 0) {
      return next(
        new AppError(
          404,
          `The videoGameConsole with serial number: ${serialNumber} is already registered`,
          1
        )
      );
    }
  }

  console.log("UBDATE", req.file);

  //Update Image
  if (req.file) {
    const imgRef = ref(storage, videoGame.imgUrl);

    if (imgRef.fullPath) {
      //Update image if a previously registered url exists
      await uploadBytes(imgRef, req.file.buffer);
    } else {
      const consoleId = videoGame.id;
      //Create new url for the new imagen
      //Upload image to cloud Storage (Firebase)
      const imgRef = ref(
        storage,
        `xbox img/${consoleId}-${Date.now()}-${req.file.originalname}`
      );
      await uploadBytes(imgRef, req.file.buffer);
    }
  }

  const data = filterObj(
    req.body,
    "nameId",
    "modelId",
    "color",
    "serialNumber",
    "hardHDD",
    "stateId"
  );

  await videoGame.update({ ...data });

  res.status(200).json({ status: "success" });
});

//?DELETE VIDEO GAME BY ID
exports.deleteVideoGame = catchAsync(async (req, res, next) => {
  const { videoGame } = req;

  videoGame.update({ status: "delete" });

  res.status(200).json({ status: "success" });
});

//?SEARCH BY KEYWORD
exports.searchByKeyword = catchAsync(async (req, res, next) => {
  const { keyword } = req.params;

  // select c.id, n.name, m.model, c.color
  // from  "videoGames" as c
  // left JOIN "videoGameNames" as n  On n."id" = c."nameId"
  // left join "videoGameModels" as m On m."id" = c."modelId"
  //  where concat(c.id, ' ',c."serialNumber", ' ',n.name) ilike concat('%','one','%') and c.status = 'active'
  const videoGame = await VideoGame.findAll({
    where: {
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn(
            "concat",
            Sequelize.col("videoGame.id"),
            Sequelize.col("serialNumber"),
            Sequelize.col("videoGameName.name"),
            Sequelize.col("videoGameModel.model")
          ),
          {
            [Op.like]: `%${keyword}%`,
          }
        ),

        { status: "active" },
      ],
    },
    attributes: {
      //include: [["videoGameName.name", "key"]],
      //include: ["videoGameName"],
      //as: "console",
      // include: ["id", "nameId"],
      exclude: ["nameId", "modelId"],
    },

    include: [
      {
        model: VideoGameName,
        //as: "n",
        where: { status: "active" },
        attributes: { exclude: ["status", "createdAt", "updatedAt"] },
      },
      {
        model: VideoGameModel,
        where: { status: "active" },
        attributes: { exclude: ["status", "createdAt", "updatedAt"] },
      },
    ],
  });

  //console.log("videoGame", videoGame);
  if (videoGame.length > 0) {
    //dowload img
    const userPromises = videoGame.map(async (item) => {
      let imgDownloadUrl;
      if (item.imgUrl) {
        // Create a storage reference from our storage service
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
                console.log(
                  "User doesn't have permission to access the object"
                );
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
      }

      item.imgUrl = imgDownloadUrl;
      return item;
    });

    const resolveVideoGame = await Promise.all(userPromises);

    res.status(200).json({ status: "success", data: resolveVideoGame });
    return;
  }

  res.status(200).json({ status: "success", data: videoGame });
});

//?SEARCH BY SERIAL NUMBER
exports.searchBySerialNumber = catchAsync(async (req, res, next) => {
  const { serialNumber } = req.params;

  const videoGame = await VideoGame.findOne({
    where: { status: "active", serialNumber },
    include: [VideoGameName, VideoGameModel],
  });

  if (!videoGame) {
    return next(new AppError(404, `Consola no encontrada`, 1));
  }

  let imgDownloadUrl;
  if (videoGame.imgUrl) {
    // Create a storage reference from our storage service
    const imgRef = ref(storage, videoGame.imgUrl);
    //imgDownloadUrl = await getDownloadURL(imgRef);
    // Get the download URL
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
  }

  videoGame.imgUrl = videoGame.imgUrl ? imgDownloadUrl : "";

  res.status(200).json({ status: "success", data: videoGame });
});
