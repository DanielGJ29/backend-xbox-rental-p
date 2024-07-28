const { DataTypes } = require("sequelize");

//Utils
const { sequelize } = require("../../util/database");

const Documents = sequelize.define("documents", {
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

  docIneFront: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  docIneReverse: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

module.exports = { Documents };
