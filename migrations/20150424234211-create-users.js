'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.createTable(
      'players',
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
        pid: {
          type: DataTypes.STRING
        },
        name: {
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
    queryInterface.dropTable('players')
  }
};
