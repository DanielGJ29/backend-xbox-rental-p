const { DataTypes } = require("sequelize");
const { sequelize } = require("../../util/database");

const Accessory = sequelize.define("accessory", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  model: {
    type: DataTypes.STRING(100),
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

  characteristics: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  imgUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  rentalPrice: {
    type: DataTypes.INTEGER,
    allowNull: true,
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

module.exports = { Accessory };
