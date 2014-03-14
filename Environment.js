var games = {};

var Environment = function(_socket) {
  var socket = _socket;

  this.handleError = function(message) {
    console.log('ERROR', message);
    socket.emit('error', message);
  };

  this.withPlayer = function(callback) {
    var _this = this;
    socket.get('player', function (err, player) {
      if (err || !player)
        return _this.handleError('You\'re not logged in.');
      callback(player);
    });
  };

  this.broadcastGameRoom = function(game, playerField) {
    if (playerField !== null)
      this.refreshGame(socket.broadcast.to(game.getName()), game, playerField);
  };

  this.refreshGame = function(receiver, game, playerField) {
    receiver.emit('refresh game', this.getGameData(game, playerField));
  };

  this.getGameData = function(game, playerField) {
    var opponent = game.getOpponent(playerField);
    return {
      active: game.isActive(playerField),
      gameOver: game.isGameOver(),
      name: game.getName(),
      own: {
        name: playerField.getName(),
        field: playerField.getField().get(),
        ready: playerField.isReady(),
        won: playerField.getPlayer().gamesWon,
        lost: playerField.getPlayer().gamesLost
      },
      opponent: opponent ? {
        name: opponent.getName(),
        field: opponent.getField().filterShot(),
        ready: opponent.isReady(),
        won: opponent.getPlayer().gamesWon,
        lost: opponent.getPlayer().gamesLost
      } : null
    };
  };

  this.getGame = function(gameName) {
    if (!games[gameName]) {
      this.handleError('Game with name <' + gameName + '> not found.');
      return null;
    }
    return games[gameName];
  };

  this.listGames = function(receiver) {
    var gameList = [];
    Object.keys(games).forEach(function (name) {
      var opponent = games[name].getVisitor();
      var creator = games[name].getCreator();
      gameList.push({
        name: name,
        creator: {
          name: creator.getName(),
          won: creator.getPlayer().gamesWon,
          lost: creator.getPlayer().gamesLost
        },
        opponent: opponent ? {
          name: opponent.getName(),
          won: opponent.getPlayer().gamesWon,
          lost: opponent.getPlayer().gamesLost
        } : null
      });
    });
    receiver.emit('list games', gameList);
  }

  this.getGame = function(name) {
    return games[name];
  }

  this.addGame = function(game) {
    games[game.getName()] = game;
  }

  this.removeGame = function(game) {
    delete games[game.getName()];
  }
};

module.exports = Environment;