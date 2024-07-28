//swagger
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

//Metadata info about our API
const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Swagger system Rental - PostgresSQL16",
      description:
        "api rest rental system videogames create with node js, express",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:4000/" }],
  },
  apis: [`${path.join(__dirname, "../routes/*.js")}`],
};

//Docs JSON format
const swaggerSpec = swaggerJsDoc(options);

//Function setup out docs
const swaggerDocs = (app, port) => {
  app.use("/api/v1/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};

module.exports = { swaggerDocs };
