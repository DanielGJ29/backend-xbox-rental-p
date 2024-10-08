const { DataTypes } = require("sequelize");
const { sequelize } = require("../../util/database");

const { VideoGameName } = require("../videoGameName/videoGameName.model");

const Gamepad = sequelize.define("gamepad", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  videoGameNameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  color: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  connectionType: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  stateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: "active",
  },

  available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

module.exports = { Gamepad };

// videogameName 1 <--> M Gamepad
VideoGameName.hasMany(Gamepad);
Gamepad.belongsTo(VideoGameName);
