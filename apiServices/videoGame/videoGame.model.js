const { DataTypes } = require("sequelize");
const { sequelize } = require("../../util/database");
const { VideoGameName } = require("../videoGameName/videoGameName.model");
const { VideoGameModel } = require("../videoGameModel/videoGameModel.model");

const VideoGame = sequelize.define("videoGame", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  nameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  modelId: {
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

  hardHDD: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  imgUrl: {
    type: DataTypes.STRING(255),
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

module.exports = { VideoGame };

VideoGameName.hasMany(VideoGame, { foreignKey: "nameId" });
VideoGame.belongsTo(VideoGameName, { foreignKey: "nameId" });

VideoGameModel.hasMany(VideoGame, { foreignKey: "modelId" });
VideoGame.belongsTo(VideoGameModel, { foreignKey: "modelId" });
