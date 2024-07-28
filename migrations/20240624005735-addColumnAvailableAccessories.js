"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "accessories",
          "available",
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: "true",
          },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("accessories", "available", {
          transaction: t,
        }),
      ]);
    });
  },
};
