function GameController($scope, socket, gameService) {
  $scope.game = gameService.getCurrentGame();

  $scope.shoot = function(field) {
    socket.emit('shoot', { name: $scope.game.name, x: field.x, y: field.y }, function(field) {
      $scope.game.opponent.field[field.y][field.x] = field;
    });
  };
}