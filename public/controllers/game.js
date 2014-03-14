function GameController($scope, socket, gameService) {
  $scope.game = gameService.getCurrentGame();
  $scope.status = 'Waiting for opponent';

  $scope.shoot = function(field) {
    socket.emit('shoot', { name: $scope.game.name, x: field.x, y: field.y }, function(field) {
      $scope.game.opponent.field[field.y][field.x] = field;
    });
  };

  socket.on('refresh game', function(data) {
    $scope.game = data;
  });

  $scope.repopulate = function() {
    socket.emit('repopulate', $scope.game.name);
  }

  $scope.ready = function() {
    socket.emit('ready', $scope.game.name);
  }
}