const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morga = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

//Controllers
const { globalErrorHandler } = require("./apiServices/error/error.controller");

//Routers
// const { usersRouter } = require("./apiServices/users/users.routes");
// const { clientRouter } = require("./routes/clients.routes");
// const { documentRouter } = require("./routes/documents.routes");
// const { sepomexRouter } = require("./routes/sepomex.routes");
// const { videoGameRouter } = require("./routes/videoGame.routes");
// const { gamepadRouter } = require("./routes/gamepad.routes");
// const { accessoryRouter } = require("./routes/accessories.routes");
// const { videoGameNameRouter } = require("./routes/videoGameName.routes");
// const { videoGameModelRouter } = require("./routes/videoGameModel.routes");
// const { cartRouter } = require("./routes/cart.routes");
const { routes } = require("./routes/index");

const app = express();

//Midlewares
app.use(express.json());
app.use(cookieParser());
//Enable multipart/form-data incoming data (to receive files)
app.use(express.urlencoded({ extended: true }));

//Enable cors
app.use("*", cors());

//Limit the time
app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: "Too many requests from your IP, Try after an hour",
  })
);

//  Compress response on the brouser
app.use(compression());

//Set more security headers
app.use(helmet());

//Log incoming request to the server
app.use(morga("dev"));

//Endpoints
// app.use("/api/v1/users", usersRouter);
// app.use("/api/v1/clients", clientRouter);
// app.use("/api/v1/documents", documentRouter);
// app.use("/api/v1/sepomex", sepomexRouter);
// app.use("/api/v1/videoGame", videoGameRouter);
// app.use("/api/v1/gamepad", gamepadRouter);
// app.use("/api/v1/accessories", accessoryRouter);
// app.use("/api/v1/videoGameName", videoGameNameRouter);
// app.use("/api/v1/videoGameModel", videoGameModelRouter);
// app.use("/api/v1/cart", cartRouter);

app.use("/api/v1", require("./routes/index"));

app.use(globalErrorHandler);

module.exports = { app };
