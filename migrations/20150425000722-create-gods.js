'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.createTable(
      'gods',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        created_at: {
          type: DataTypes.DATE
        },
        updated_at: {
          type: DataTypes.DATE
        },
        name: {
          type: DataTypes.STRING
        },
        alias: {
          type: DataTypes.STRING
        },
        wins: {
          type: DataTypes.INTEGER
        },
        defeats: {
          type: DataTypes.INTEGER
        }
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.dropTable('gods')
  }
};
