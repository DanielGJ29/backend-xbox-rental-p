const express = require("express");
const cors = require("cors");

//Controllers
const { globalErrorHandler } = require("./controllers/error.controller");

//Routers
const { usersRouter } = require("./routes/users.routes");
const { clientRouter } = require("./routes/clients.routes");
const { documentRouter } = require("./routes/documents.routes");
const { sepomexRouter } = require("./routes/sepomex.routes");
const { videoGameRouter } = require("./routes/videoGame.routes");
const { gamepadRouter } = require("./routes/gamepad.routes");
const { accessoryRouter } = require("./routes/accessories.routes");
const { videoGameNameRouter } = require("./routes/videoGameName.routes");
const { videoGameModelRouter } = require("./routes/videoGameModel.routes");
const { cartRouter } = require("./routes/cart.routes");

const app = express();

//Midlewares
app.use(express.json());
//Enable multipart/form-data incoming data (to receive files)
app.use(express.urlencoded({ extended: true }));

//Enable cors
app.use("*", cors());

//Endpoints
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/sepomex", sepomexRouter);
app.use("/api/v1/videoGame", videoGameRouter);
app.use("/api/v1/gamepad", gamepadRouter);
app.use("/api/v1/accessories", accessoryRouter);
app.use("/api/v1/videoGameName", videoGameNameRouter);
app.use("/api/v1/videoGameModel", videoGameModelRouter);
app.use("/api/v1/cart", cartRouter);

app.use(globalErrorHandler);

module.exports = { app };
