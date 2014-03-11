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

  socket.on('error', function (message) {
    console.log('received ', message);
    var $error = $('.error');
    $error.show();
    $scope.error = message;
    $error.delay(2000).fadeOut();
  });

  socket.on('logged in', function() {
    $location.path("/lobby");
  })

}