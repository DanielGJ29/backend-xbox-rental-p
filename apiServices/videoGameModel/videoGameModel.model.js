const { DataTypes } = require("sequelize");
const { sequelize } = require("../../util/database");

const VideoGameModel = sequelize.define("videoGameModel", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  rentalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: "active",
  },
});

module.exports = { VideoGameModel };
