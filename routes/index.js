const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const removeExtension = (fileName) => fileName.split(".").shift();
const patchRouterApiServices = path.resolve("apiServices");
fs.readdirSync(patchRouterApiServices).filter((folder) => {
  const pathRouterChildren = path.resolve("apiServices", folder);
  const subFolder = fs.readdirSync(pathRouterChildren);
  const onlyRoutes = subFolder.filter((file) => file.includes("routes"))[0];

  if (onlyRoutes) {
    const nameRoute = removeExtension(onlyRoutes);
    //console.log("file---->", onlyRoutes);
    //console.log("name ruta", nameRoute);
    router.use(
      `/${nameRoute}`,
      require(`../apiServices/${nameRoute}/${nameRoute}.routes`)
    ); //TODO localhost/user
  }
});

//?Funciona cuando las rutas estan en la misma carpetas
//const pathRouter = `${__dirname}`;
// fs.readdirSync(pathRouter).filter((file) => {
//   const fileWithOutExt = removeExtension(file);
//   const skip = ["index"].includes(fileWithOutExt);

//   if (!skip) {
//     console.log("file---->", fileWithOutExt);
//     router.use(
//       `/${fileWithOutExt}`,
//       require(`./apiServices/${fileWithOutExt}/${fileWithOutExt}.routes`)
//     ); //TODO localhost/user
//   }
// });

router.get("*", (req, res) => {
  res.status(400);
  res.send({ error: "Not found the point" });
});

//Swagger Schemas auth
/**
 * @swagger
 * components:
 *  securitySchemes:
 *    ApiAuth:
 *      type: apiKey
 *      in: header
 *      name : authorization
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    Users:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: the user name
 *        lastName:
 *          type: string
 *          description: the user lastName
 *        motherLastName:
 *          type: string
 *          description: the user motherLastName
 *        email:
 *          type: string
 *          description: the user email
 *        userName:
 *          type: string
 *          description: the user userName
 *        password:
 *          type: string
 *          description: the user password
 *        avatarUrl:
 *          type: file
 *          description: the user avatar
 *        role:
 *          type: string
 *          description: the user roles
 *      required:
 *        -name
 *        -lastName
 *        -email
 *        -userNmae
 *        -password
 *        -role
 *      example:
 *        name: daniel
 *        lastName: gonzalez
 *        motherLastName: Jimenez
 *        email: daniel2@gmail.com
 *        userName: dani
 *        password: '123'
 *        role: guest
 *    Login:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          description: the user email
 *        password:
 *          type: string
 *          description: the user password
 *      required:
 *        -email
 *        -password
 *      example:
 *        email: daniel2@gmail.com
 *        password: '123'
 */

module.exports = router;
