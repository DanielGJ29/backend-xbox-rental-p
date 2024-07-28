const { DataTypes } = require("sequelize");

//Utils
const { sequelize } = require("../../util/database");

const Sepomex = sequelize.define(
  "sepomex",
  {
    zipCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    colony: {
      type: DataTypes.STRING(100),
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
  },
  { freezeTableName: true, timestamps: false }
);

Sepomex.removeAttribute("id");

module.exports = { Sepomex };
