const { body, validationResult } = require("express-validator");

//Utils
const { catchAsync } = require("../util/catchAsync");
const { AppError } = require("../util/appError");

exports.createUserValidators = [
  body("name")
    .isString()
    .withMessage("Name must by a string")
    .notEmpty()
    .withMessage("Must provide a valid name"),
  body("lastName")
    .isString()
    .withMessage("Last Name must by a string")
    .notEmpty()
    .withMessage("Last Name provide a valid Last Name"),
  body("motherLastName")
    .isString()
    .withMessage("Mother Last Name must by a string")
    .notEmpty()
    .withMessage("Mother Last Name provide a valid Mother Last Name"),
  body("email")
    .isString()
    .withMessage("Email must by a string")
    .notEmpty()
    .withMessage("Email provide a valid email"),
  body("userName")
    .isString()
    .withMessage("User Name must by a string")
    .notEmpty()
    .withMessage("User Name provide a valid User Name"),
  body("password")
    .isString()
    .withMessage("Password must by a string")
    .notEmpty()
    .withMessage("Password provide a valid Password"),
  body("role")
    .isString()
    .withMessage("Role must by a string")
    .notEmpty()
    .withMessage("Role provide a valid Role"),
];

exports.createClientValidators = [
  body("name")
    .isString()
    .withMessage("Name must by a string")
    .notEmpty()
    .withMessage("Must provide a valid name"),
  body("lastName")
    .isString()
    .withMessage("Last Name must by a string")
    .notEmpty()
    .withMessage("Last Name provide a valid Last Name"),
  body("motherLastName")
    .isString()
    .withMessage("Mother Last Name must by a string")
    .notEmpty()
    .withMessage("Mother Last Name provide a valid Mother Last Name"),
  body("email")
    .isString()
    .withMessage("Email must by a string")
    .notEmpty()
    .withMessage("Email provide a valid email"),
  body("phone")
    .isString()
    .withMessage("phone must by a string")
    .notEmpty()
    .withMessage("phone provide a valid numberPhone"),

  // ,
  // city,
  // municipality,
  // state,
  body("socialNetworkId")
    .isNumeric()
    .withMessage("socialNetworkId must by a integer")
    .notEmpty()
    .withMessage("socialNetworkId provide a valid socialNetworkId "),
  body("street")
    .isString()
    .withMessage("street must by a string")
    .notEmpty()
    .withMessage("street provide a valid street"),
  body("numberInt")
    .isString()
    .withMessage("numberInt must by a string")
    .notEmpty()
    .withMessage("numberInt provide a valid numberInt"),
  body("numberOut")
    .isString()
    .withMessage("numberOut must by a string")
    .notEmpty()
    .withMessage("numberOut provide a valid numberOut"),
  body("colony")
    .isString()
    .withMessage("colony must by a string")
    .notEmpty()
    .withMessage("colony provide a valid colony"),
  body("zipCode")
    .isNumeric()
    .withMessage("zipCode must by a integer")
    .notEmpty()
    .withMessage("zipCode provide a valid zipCode"),
  body("city")
    .isString()
    .withMessage("city must by a integer")
    .notEmpty()
    .withMessage("city provide a valid city"),
  body("municipality")
    .isString()
    .withMessage("municipality must by a string")
    .notEmpty()
    .withMessage("municipality provide a valid municipality"),
  body("state")
    .isString()
    .withMessage("state must by a string")
    .notEmpty()
    .withMessage("state provide a valid state"),
];

exports.validateResult = catchAsync(async (req, res, next) => {
  //Validate req.body
  const errors = validationResult(req);

  const errorMsg = errors
    .array()
    .map(({ msg }) => msg)
    .join(". ");
  if (!errors.isEmpty()) {
    return next(new AppError(400, errorMsg));
  }
  next();
});
