const bycryp = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const dotenv = require("dotenv");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { validationResult } = require("express-validator");

//Models
const { User } = require("./user.model");

//util
const { catchAsync } = require("../../util/catchAsync");
const { AppError } = require("../../util/appError");
const { storage } = require("../../util/firebase");
const { filterObj } = require("../../util/filterObj");
const {
  generateRefreshToken,
  generateToken,
} = require("../../util/tokenManager.js");

const { Sequelize } = require("sequelize");

dotenv.config({ path: "./config.env" });

//?GET ALL USERS
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
    where: { status: "active" },
  });

  const userPromises = users.map(
    async ({
      id,
      name,
      lastName,
      motherLastName,
      email,
      userName,
      password,
      avatarUrl,
      role,
      status,
      createdAt,
      updatedAt,
    }) => {
      let imgDownloadUrl;
      if (avatarUrl) {
        const imgRef = ref(storage, avatarUrl);
        imgDownloadUrl = await getDownloadURL(imgRef);
      }
      return {
        id,
        name,
        lastName,
        motherLastName,
        email,
        userName,
        password,
        avatarUrl: avatarUrl ? imgDownloadUrl : null,
        role,
        status,
        createdAt,
        updatedAt,
      };
    }
  );

  const resolveUsers = await Promise.all(userPromises);

  res.status(200).json({
    status: "success",
    data: resolveUsers,
  });
});

//?NEW USER
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, lastName, motherLastName, email, userName, password, role } =
    req.body;

  const countClient = await User.findAll({
    // attributes: [Sequelize.fn("COUNT", Sequelize("*"))],
  });

  let resultUploadBytes;
  let imgDownloadUrl;
  if (req.file) {
    let countId = 0;
    if (countClient.length > 0) {
      countId = countClient.length + 1;
    } else {
      countId = 1;
    }

    //Upload img to Cloud Storage (Firebase)
    const imgRef = ref(
      storage,
      `User avatar/${countId}-${Date.now()}-${req.file.originalname}`
    );

    resultUploadBytes = await uploadBytes(imgRef, req.file.buffer);

    //DowloanImg
    imgDownloadUrl = await getDownloadURL(imgRef);
  }

  //Encryptation password
  const salt = await bycryp.genSalt(12);
  const hashedPassword = await bycryp.hash(password, salt);

  const newUser = await User.create({
    name,
    lastName,
    motherLastName,
    email,
    userName,
    password: hashedPassword,
    //avatarUrl: req.file.path,
    avatarUrl: req.file ? resultUploadBytes.metadata.fullPath : null,
    //avatarUrl: imgDownloadUrl,
    role,
  });

  newUser.password = undefined;
  newUser.avatarUrl = req.file ? imgDownloadUrl : undefined;

  res.status(200).json({
    status: "success",
    data: { newUser },
  });
});

//?GET USER BY ID
exports.getUserById = catchAsync(async (req, res, next) => {
  const { user } = req;

  if (user.avatarUrl) {
    const imgRef = ref(storage, user.avatarUrl);
    const imgDownloadUrl = await getDownloadURL(imgRef);

    user.avatarUrl = imgDownloadUrl;
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

//?UPDATE USER
exports.updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  //Update Imgagen
  let newUrl = false;
  let resultUploadBytes;
  if (req.file) {
    const imgRef = ref(storage, user.avatarUrl);
    //actualiza avatar si existe una url previamente registrada
    //Update avatar if a previously registered url exists
    if (imgRef.fullPath) {
      console.log("hay un path");
      const result = await uploadBytes(imgRef, req.file.buffer);
    } else {
      console.log("no hay un path se creara url");
      //Crea nueva url para el nuevo avatar
      //Create new url for the new avatar

      const UserId = user.id;

      //Upload img to Cloud Storage (Firebase)
      const imgRef = ref(
        storage,
        `User avatar/${UserId}-${Date.now()}-${req.file.originalname}`
      );
      resultUploadBytes = await uploadBytes(imgRef, req.file.buffer);

      //DowloanImg
      const imgDownloadUrl = await getDownloadURL(imgRef);
    }
  }

  const data = filterObj(
    req.body,
    "name",
    "lastName",
    "motherLastName",
    "email",
    "userName"
  );

  if (resultUploadBytes) {
    data.avatarUrl = resultUploadBytes.metadata.fullPath;
  }

  await user.update({ ...data });

  res.status(200).json({ status: "success" });
});

//?LOGIN
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = await req.body;

  const user = await User.findOne({ where: { email, status: "active" } });

  if (!user || !(await bycryp.compare(password, user.password))) {
    return next(new AppError(404, "credentials are invalid", "01"));
  }

  const token = generateToken(user.id);

  const refreshToken = generateRefreshToken(user.id, res);

  user.password = undefined;

  if (user.avatarUrl) {
    const imgRef = ref(storage, user.avatarUrl);
    const imgDownloadUrl = await getDownloadURL(imgRef);
    user.avatarUrl = imgDownloadUrl;
  }

  res.status(200).json({
    status: "success",
    data: { user, token, refreshToken },
  });
});

//?REFRESH-TOKEN
exports.refreshToken = catchAsync(async (req, res, next) => {
  // let token;

  //console.log("REQ", req.headers.refreshtoken);
  //const refreshToken = req.cookies.refreshToken;
  const refresh = req.headers.refreshtoken;

  if (!refresh) {
    return next(new AppError(400, "Invalid refrehToken"));
  }

  const decodedToken = await promisify(jwt.verify)(
    refresh,
    process.env.JWT_REFRESH_SECRET
  );

  const token = generateToken(decodedToken.id);

  const refreshToken = generateRefreshToken(decodedToken.id, res);

  const user = await User.findOne({
    where: { id: decodedToken.id, status: "active" },
  });

  if (user.avatarUrl) {
    const imgRef = ref(storage, user.avatarUrl);
    const imgDownloadUrl = await getDownloadURL(imgRef);
    user.avatarUrl = imgDownloadUrl;
  }

  user.password = undefined;

  res.status(200).json({
    status: "success",
    data: { user, token, refreshToken },
  });
});

//?CHECK-TOKEN
exports.checkToken = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: "success" });
});

//?DELETE USER
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  user.update({ status: "delete" });

  res.status(200).json({
    status: "success",
  });
});
