var Box = require('./Box');
var FieldPopulator = require('./FieldPopulator');

var Field = function () {
  var SHIPS = [5, 4, 4, 3, 3, 3, 2, 2, 2, 2];
  var SIZE = 10;

  var field = [];
  for (var i = 0; i < SIZE; i++) {
    field[i] = [];
    for (var j = 0; j < SIZE; j++) {
      field[i][j] = new Box(i, j);
    }
  }

  this.populate = function () {
    SHIPS.forEach(function (ship) {
      new FieldPopulator(field, ship).populate();
    });
  };

  this.get = function () {
    return field;
  }
};

module.exports = Field;
