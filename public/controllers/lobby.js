function LobbyController($scope, $location, socket, gameService) {
  socket.emit('list games');

  socket.on('list games', function (data) {
    $scope.games = data;
  });

  $scope.createGame = function() {
    socket.emit('create game', { name: $scope.newGameName });
  };

  $scope.join = function(game) {
    socket.emit('join game', { name: game.name })
  }

  socket.on('joined game', function(data) {
    gameService.setCurrentGame(data);
    $location.path("/game");
  });

}