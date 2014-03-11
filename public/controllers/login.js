function LoginController($scope, $location) {
  $scope.login = function() {

  };

  $scope.createAccount = function() {

  };

  $scope.own = initField();
  $scope.opponent = initField();

  $scope.click = function(field) {
    field.hasShip = !field.hasShip;
  };

  $scope.createRoom = function() {
    socket.emit('create room', { my: 'data' });
  };

}