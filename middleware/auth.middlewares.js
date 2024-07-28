const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { promisify } = require("util");

// Models
const { User } = require("../apiServices/users/user.model");

//Utils
const { AppError } = require("../util/appError");
const { catchAsync } = require("../util/catchAsync");

dotenv.config({ path: "./config.env" });

exports.validateSession = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError(400, "Invalid session"));
  }

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findOne({
    attributes: { exclude: ["password"] },
    where: { id: decodedToken.id, status: "active" },
  });

  if (!user) {
    return next(new AppError(401, "Invalid session"));
  }

  req.currentUser = user;

  next();
});

exports.protecAdmin = catchAsync(async (req, res, next) => {
  if (req.currentUser.role !== "admin") {
    return next(
      new AppError(
        403,
        "No cuenta con los permisos suficientes /\nAccess denie"
      )
    );
  }

  next();
});
