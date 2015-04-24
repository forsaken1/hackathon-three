'use strict';
module.exports = function(sequelize, DataTypes) {
  var Battle = sequelize.define('Battle', {
    first_player: DataTypes.INTEGER,
    second_player: DataTypes.INTEGER,
    first_bog: DataTypes.INTEGER,
    second_bog: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Battle;
};