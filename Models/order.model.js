const { DataTypes } = require("sequelize");
const { sequelize } = require("../util/database");

const Order = sequelize.define("order", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  rentalDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: 1,
  },

  status: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: "active",
  },
});

module.exports = { Order };
