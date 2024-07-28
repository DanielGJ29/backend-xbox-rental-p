const { DataTypes } = require("sequelize");
const { sequelize } = require("../../util/database");

const Client = sequelize.define("client", {
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
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  motherLastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  phone: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },

  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  socialNetworkId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  linkSocialNetwork: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },

  street: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  numberInt: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },

  numberOut: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },

  colony: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  zipCode: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },

  city: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },

  municipality: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },

  state: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },

  avatarUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  status: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: "active",
  },
});

module.exports = { Client };
