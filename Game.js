var PlayerField = require('./PlayerField.js');

var Game = function (_name, creatorName) {
  var name = _name;
  var creator = new PlayerField(creatorName);
  var visitor = null;

  this.getName = function() {
    return name;
  };

  this.getCreator = function() {
    return creator;
  };

  this.getVisitor = function() {
    return visitor;
  };

  this.setVisitorName = function(opponentName) {
    visitor = new PlayerField(opponentName);
  };

  this.getPlayerField = function(playerName) {
    if (playerName === creator.getName())
      return creator;
    if (visitor !== null && playerName === visitor.getName())
      return visitor;
    return null;
  }

  this.getOpponent = function(playerField) {
    if (creator.getName() === playerField.getName())
      return visitor;
    return creator;
  }
};

module.exports = Game;