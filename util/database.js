const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

//Localhost connection
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
  port: process.env.PORT_BD,
  dialect: process.env.DB_DIALECT,
  logging: false,
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
});

module.exports = { sequelize };
