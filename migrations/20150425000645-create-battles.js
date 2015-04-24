'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.createTable(
      'battles',
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
        first_player: {
          type: DataTypes.INTEGER
        },
        first_god: {
          type: DataTypes.STRING
        },
        second_player: {
          type: DataTypes.INTEGER
        },
        second_god: {
          type: DataTypes.STRING
        },
        winner: {
          type: DataTypes.INTEGER
        }
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.dropTable('battles')
  }
};
