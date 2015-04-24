'use strict';
module.exports = function(sequelize, DataTypes) {
  var God = sequelize.define('God', {
    alias: DataTypes.STRING,
    name: DataTypes.STRING,
    wins: DataTypes.INTEGER,
    defeats: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return God;
};