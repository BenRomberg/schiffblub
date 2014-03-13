var PlayerField = require('./PlayerField.js');

var Game = function (_name, creatorName) {
  var name = _name;
  var creator = new PlayerField(creatorName);
  var opponent = null;

  this.getName = function() {
    return name;
  };
  this.getCreator = function() {
    return creator;
  };
  this.getOpponent = function() {
    return opponent;
  };
  this.setOpponentName = function(opponentName) {
    opponent = new PlayerField(opponentName);
  };
};

module.exports = Game;