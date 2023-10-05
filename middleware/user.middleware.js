//Models
const { User } = require("../Models/user.model");

//Utils
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");

exports.userExist = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({
    where: { status: "active", id },
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    return next(new AppError(404, "User with Id not found"));
  }

  req.user = user;

  next();
});

exports.protectAccountOwner = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { currentUser } = req;

  if (currentUser.id !== +id) {
    return next(new AppError(403, "You can't update other users account"));
  }

  next();
});
