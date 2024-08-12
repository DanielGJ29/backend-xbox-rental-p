const express = require("express");
const { body } = require("express-validator");

//Controllers
const {
  createUser,
  getAllUsers,
  getUserById,
  login,
  refreshToken,
  checkToken,
  updateUser,
  deleteUser,
} = require("./users.controller");

//Middlewares
const {
  validateSession,
  protecAdmin,
} = require("../../middleware/auth.middlewares");
const {
  userExist,
  protectAccountOwner,
} = require("../../middleware/user.middleware");
const {
  createUserValidators,
  validateResult,
} = require("../../middleware/validators.middleware");

//Utils
const { upload } = require("../../util/multer");

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/login:
 *  post:
 *    summary: login
 *    tags: [Login]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Login'
 *    responses:
 *      200:
 *        description: login success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: active
 *                data:
 *                  type: object
 *                  properties:
 *                    user:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: number
 *                          example: 1
 *                        name:
 *                          type: string
 *                          example : daniel
 *                        lastName:
 *                          type: string
 *                          example : Gonxslrx
 *                        motherLastName:
 *                          type: string
 *                          example : smith
 *                        email:
 *                          type: string
 *                          example : correo@micorreo.com
 *                        userName:
 *                          type: string
 *                          example : user
 *                        avatarUrl:
 *                          type: string
 *                          example : string
 *                        role:
 *                          type: string
 *                          example : guest
 *                        status:
 *                          type: string
 *                          example : active
 *                    token:
 *                      type: string
 *                      example: 4858ejr8eju885jr8j48j848
 */
router.post("/login", login);

router.post("/refreshToken", refreshToken);

//router.use(validateSession);
/**
 * @swagger
 * /api/v1/users:
 *  post:
 *    summary: create new user
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Users'
 *    responses:
 *      200:
 *        description: new user created
 */
router.post(
  "/",
  //protecAdmin,
  upload.single("avatarUrl"),
  createUserValidators,
  validateResult,
  createUser
);

/**
 * @swagger
 * /api/v1/users:
 *  get:
 *    summary: list all user
 *    security:
 *      - ApiAuth: []
 *    tags: [User]
 *    responses:
 *      200:
 *        description: all user
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Users'
 */
router.get("/", protecAdmin, getAllUsers);

/**
 * @swagger
 * /api/v1/users/check-token:
 *  get:
 *    summary: check token
 *    tags: [Login]
 *    responses:
 *      200:
 *        description: ok
 */

router.get("/check-token", protecAdmin, checkToken);

router.use("/:id", userExist);

/**
 * @swagger
 * /api/v1/users/{id}:
 *  get:
 *    summary: List all User
 *    security:
 *      - ApiAuth: []
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: the user Id
 *    responses:
 *      200:
 *        description: get user by id
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Users'
 *      404:
 *        description: user not found
 *      500:
 *        description: Internal Server Error
 */
router.get("/:id", protectAccountOwner, getUserById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *  patch:
 *    summary: update user by id
 *    security:
 *      - ApiAuth: []
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: update user Id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Users'
 *    responses:
 *      200:
 *        description: ubdate user
 *      404:
 *        description: user not found
 */
router.patch(
  "/:id",
  protectAccountOwner,
  upload.single("avatarUrl"),
  updateUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *  delete:
 *    summary: delete user by id
 *    security:
 *      - ApiAuth: []
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: the user Id
 *    responses:
 *      200:
 *        description: delete user by id
 *      404:
 *        description: user not found
 */
router.delete("/:id", protecAdmin, deleteUser);

module.exports = router;
