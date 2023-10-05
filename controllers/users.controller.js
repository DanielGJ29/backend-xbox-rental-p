const bycryp = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { validationResult } = require("express-validator");

//Models
const { User } = require("../Models/user.model");

//util
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");
const { storage } = require("../util/firebase");
const { filterObj } = require("../util/filterObj");

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
      const imgRef = ref(storage, avatarUrl);
      const imgDownloadUrl = await getDownloadURL(imgRef);
      return {
        id,
        name,
        lastName,
        motherLastName,
        email,
        userName,
        password,
        avatarUrl: imgDownloadUrl,
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

  const result = await uploadBytes(imgRef, req.file.buffer);

  //DowloanImg
  const imgDownloadUrl = await getDownloadURL(imgRef);

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
    avatarUrl: result.metadata.fullPath,
    //avatarUrl: imgDownloadUrl,
    role,
  });

  newUser.password = undefined;
  newUser.avatarUrl = imgDownloadUrl;

  res.status(200).json({
    status: "success",
    data: { newUser },
  });
});

//?GET USER BY ID
exports.getUserById = catchAsync(async (req, res, next) => {
  const { user } = req;

  const imgRef = ref(storage, user.avatarUrl);
  const imgDownloadUrl = await getDownloadURL(imgRef);

  user.avatarUrl = imgDownloadUrl;

  res.status(200).json({
    status: "success",
    data: user,
  });
});

//?UPDATE USER
exports.updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  //Update Imgagen
  if (req.file) {
    const imgRef = ref(storage, user.avatarUrl);
    const result = await uploadBytes(imgRef, req.file.buffer);
  }

  const data = filterObj(
    req.body,
    "name",
    "lastName",
    "motherLastName",
    "email",
    "userName"
  );

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

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  const imgRef = ref(storage, user.avatarUrl);
  const imgDownloadUrl = await getDownloadURL(imgRef);

  user.avatarUrl = imgDownloadUrl;

  res.status(200).json({
    status: "success",
    data: { user, token },
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
