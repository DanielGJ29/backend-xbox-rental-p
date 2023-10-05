const { DataTypes } = require("sequelize");
const { sequelize } = require("../util/database");

const Stock = sequelize.define("stock", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  existence: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = { Stock };
