function LobbyController($scope, socket, $location) {
  socket.emit('list games');

  socket.on('list games', function (data) {
    $scope.games = data;
  });

  $scope.createGame = function() {
    socket.emit('create game', { name: $scope.newGameName });
  };

}