var GameController = function(socket, environment) {
  socket.on('repopulate', function (gameName) {
    withPlayerAndGame(gameName, function (playerField, game) {
      if (playerField.isReady())
        return environment.handleError('Cannot repopulate after you\'re ready.');
      playerField.repopulate();
      environment.refreshGame(socket, game, playerField);
    });
  });

  socket.on('ready', function (gameName) {
    withPlayerAndGame(gameName, function (playerField, game) {
      playerField.confirmReady();
      refreshAndBroadcastGame(game, playerField);
    });
  });

  socket.on('shoot', function (data) {
    withPlayerAndGame(data.name, function (playerField, game) {
      if (!game.getCreator().isReady() || game.getVisitor() === null || !game.getVisitor().isReady())
        return environment.handleError('The game hasn\'t started.');
      if (!game.isActive(playerField))
        return environment.handleError('It\'s not your turn.');
      try {
        game.shoot(data.x, data.y);
      } catch (e) {
        return environment.handleError(e);
      }
      handleGameOver(game);
      refreshAndBroadcastGame(game, playerField);
    });

    function handleGameOver(game) {
      if (game.isGameOver()) {
        environment.removeGame(game);
        environment.listGames(socket.broadcast);
      }
    }
  });

  function refreshAndBroadcastGame(game, playerField) {
    environment.refreshGame(socket, game, playerField);
    environment.broadcastGameRoom(game, game.getOpponent(playerField));
  }

  function withPlayerAndGame(gameName, func) {
    environment.withPlayer(function (player) {
      var game = environment.getGame(gameName);
      if (!game) return;
      var playerField = game.getPlayerField(player.name);
      if (!playerField)
        return environment.handleError('You are not part of this game.');
      func(playerField, game);
    });
  }
};

module.exports = GameController;