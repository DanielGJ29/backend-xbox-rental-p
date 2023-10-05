const { app } = require("./app.js");

//Utils
const { sequelize } = require("./util/database");
const { initModels } = require("./util/initModels");

//Database authenticated
sequelize
  .authenticate()
  .then((result) =>
    console.log("Connection has been established successfully.")
  )
  .catch((err) => console.error("Unable to connect to the database:", err));

// Init relations
initModels();

// Database synced with models' relations
sequelize
  .sync({ force: false })
  .then(() => console.log("Database synced"))
  .catch((err) => console.log(err));

//Raise server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express app runing on port: ${PORT}`);
});
