var Box = require('./Box');
var FieldPopulator = require('./FieldPopulator');

var Field = function () {
  //var SIZE = 10;
  //var SHIPS = [5, 4, 4, 3, 3, 3, 2, 2, 2, 2];
  var SIZE = 4;
  var SHIPS = [2];

  var field;
  initializeField();

  function initializeField() {
    field = [];
    for (var i = 0; i < SIZE; i++) {
      field[i] = [];
      for (var j = 0; j < SIZE; j++) {
        field[i][j] = new Box(i, j);
      }
    }
  }

  this.populate = function () {
    while (true) {
      try {
        SHIPS.forEach(function (ship) {
          new FieldPopulator(field, ship).populate();
        });
        break;
      } catch (e) {
        // try again
        initializeField();
      }
    }
  };

  this.filterShot = function () {
    var filtered = [];
    for (var i = 0; i < SIZE; i++) {
      filtered[i] = [];
      for (var j = 0; j < SIZE; j++) {
        if (field[i][j].wasShot)
          filtered[i][j] = field[i][j];
        else
          filtered[i][j] = new Box(i, j);
      }
    }
    return filtered;
  };

  this.areAllShipsShot = function() {
    var allShipsCount = 0;
    SHIPS.forEach(function (ship) {
      allShipsCount += ship;
    });
    var count = 0;
    for (var i = 0; i < SIZE; i++) {
      for (var j = 0; j < SIZE; j++) {
        if (field[i][j].wasShot && field[i][j].hasShip)
          count++;
      }
    }
    return count === allShipsCount;
  };

  this.get = function () {
    return field;
  }
};

module.exports = Field;
