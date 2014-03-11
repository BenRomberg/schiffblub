function LoginController($scope, socket, $location) {
  $scope.error = '';

  function sendLoginInfo(method) {
    socket.emit(method, { name: $scope.name, password: $scope.password });
  }

  $scope.login = function() {
    sendLoginInfo('login');
  };

  $scope.register = function() {
    sendLoginInfo('register');
  };

  socket.on('logged in', function() {
    $location.path("/lobby");
  })

}