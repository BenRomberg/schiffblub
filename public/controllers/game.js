function GameController($scope, socket, gameService) {
  $scope.game = gameService.getCurrentGame();

  $scope.click = function(field) {
    field.hasShip = !field.hasShip;
  };
}