var PlayerField = require('./PlayerField.js');

var Game = function (_name, creatorName) {
  var name = _name;
  var creator = new PlayerField(creatorName);
  var visitor = null;
  var active = creator;
  var gameOver = false;

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

  this.isActive = function(playerField) {
    return playerField.getName() === active.getName();
  }

  this.shoot = function(x, y) {
    var opponent = this.getOpponent(active);
    var shotField = opponent.getField().get()[y][x];
    if (shotField.wasShot)
      throw 'Cannot shoot a location that was already shot.';
    shotField.wasShot = true;
    if (opponent.getField().areAllShipsShot()) {
      gameOver = true;
      return;
    }
    active = opponent;
  }

  this.isGameOver = function() {
    return gameOver;
  }
};

module.exports = Game;