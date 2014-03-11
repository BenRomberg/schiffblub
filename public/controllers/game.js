var SIZE = 10;

var Field = function(i, j) {
  this.x = i;
  this.y = j;
  this.hasShip = false;
  this.wasShot = false;
};

var initField = function() {
  var field = [];
  for (var i = 0; i < SIZE; i++) {
    field[i] = [];
    for (var j = 0; j < SIZE; j++) {
      field[i][j] = new Field(i, j);
    }
  }
  return field;
}

function GameController($scope, $location) {
  $scope.own = initField();
  $scope.opponent = initField();

  $scope.click = function(field) {
    field.hasShip = !field.hasShip;
  };

  $scope.createRoom = function() {
    socket.emit('create room', { my: 'data' });
  };

}