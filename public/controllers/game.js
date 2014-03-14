function GameController($scope, socket, gameService) {
  $scope.game = gameService.getCurrentGame();
  $scope.status = getStatus($scope.game);

  $scope.shoot = function (field) {
    socket.emit('shoot', { name: $scope.game.name, x: field.x, y: field.y });
  };

  function getStatus(game) {
    if (game.opponent === null)
      return 'Waiting for opponent';
    if (!game.own.ready || !game.opponent.ready)
      return 'Waiting for both players to be ready';
    if (game.gameOver) {
      if (game.active)
        return 'You have won :-)';
      return 'You have lost :-('
    }
    if (game.active)
      return 'It\'s your turn';
    return 'It\'s the opponent\'s turn';
  }

  socket.on('refresh game', function (data) {
    $scope.game = data;
    $scope.status = getStatus($scope.game);
  });

  $scope.repopulate = function () {
    socket.emit('repopulate', $scope.game.name);
  };

  $scope.ready = function () {
    socket.emit('ready', $scope.game.name);
  };
}