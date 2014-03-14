var Game = require('./Game');

var LobbyController = function(socket, environment) {
  socket.on('list games', function (data) {
    environment.listGames(socket);
  });

  socket.on('create game', function (gameName) {
    if (!gameName)
      return environment.handleError('Please enter a name.');
    if (environment.getGame(gameName))
      return environment.handleError('Game with name <' + gameName + '> already exists.');
    environment.withPlayer(function (player) {
      environment.addGame(new Game(gameName, player));
      console.log('created and joined game ' + gameName);
      broadcastGameJoined(environment.getGame(gameName), environment.getGame(gameName).getCreator());
    });
  });

  socket.on('join game', function (gameName) {
    environment.withPlayer(function (player) {
      var game = environment.getGame(gameName);
      if (!game) return;
      var existingPlayerField = game.getPlayerField(player.name);
      if (existingPlayerField !== null) {
        sendGameJoined(game, existingPlayerField);
        return;
      }
      if (game.getVisitor() !== null)
        return environment.handleError('Game is full.');
      game.setVisitorPlayer(player);
      console.log('joined game ' + gameName);
      broadcastGameJoined(game, game.getVisitor());
      environment.broadcastGameRoom(game, game.getCreator());
    });
  });

  function broadcastGameJoined(game, playerField) {
    environment.listGames(socket.broadcast);
    sendGameJoined(game, playerField);
  }

  function sendGameJoined(game, playerField) {
    socket.join(game.getName());
    socket.emit('joined game', environment.getGameData(game, playerField));
  }
};

module.exports = LobbyController;