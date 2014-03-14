var PlayerField = require('./PlayerField.js');
var Player = require('./Player');

var Game = function (_name, creatorPlayer) {
  var name = _name;
  var creator = new PlayerField(creatorPlayer);
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

  this.setVisitorPlayer = function(visitorPlayer) {
    visitor = new PlayerField(visitorPlayer);
  };

  this.getPlayerField = function(playerName) {
    if (playerName === creator.getName())
      return creator;
    if (visitor !== null && playerName === visitor.getName())
      return visitor;
    return null;
  };

  this.getOpponent = function(playerField) {
    if (creator.getName() === playerField.getName())
      return visitor;
    return creator;
  };

  this.isActive = function(playerField) {
    return playerField.getName() === active.getName();
  };

  this.shoot = function(x, y) {
    var opponent = this.getOpponent(active);
    var shotField = opponent.getField().get()[y][x];
    if (shotField.wasShot)
      throw 'Cannot shoot a location that was already shot.';
    shotField.wasShot = true;
    if (opponent.getField().areAllShipsShot()) {
      gameOver = true;
      updatePlayers(opponent);
      return;
    }
    active = opponent;
  };

  var updatePlayers = function(loser) {
    active.getPlayer().gamesWon++;
    getPlayer(active.getName(), function(player) {
      player.gamesWon++;
      player.save();
    });
    loser.getPlayer().gamesLost++;
    getPlayer(loser.getName(), function(player) {
      player.gamesLost++;
      player.save();
    });
  };

  var getPlayer = function(playerName, callback) {
    Player.findOne({ 'name': playerName }, function (err, player) {
      callback(player);
    });
  };

  this.isGameOver = function() {
    return gameOver;
  };
};

module.exports = Game;