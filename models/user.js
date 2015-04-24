'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    pid: DataTypes.STRING,
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
  return User;
};