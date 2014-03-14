var FieldPopulator = function (field, ship) {
  var size = field.length;

  this.populate = function () {
    if (!this.isPositionAvailable()) {
      throw 'no position available';
    }
    var positionFound = false, position;
    while (!positionFound) {
      positionFound = true;
      position = getRandomShipPosition();
      positionFound = this.isShipPositionFree(position);
    }
    for (var i = 0; i < ship; i++) {
      field[position.initY + position.multY * i][position.initX + position.multX * i].hasShip = true;
    }
  };

  this.isShipPositionFree = function (position) {
    for (var x = position.initX - 1; x <= position.initX + 1 + position.multX * (ship - 1); x++) {
      for (var y = position.initY - 1; y <= position.initY + 1 + position.multY * (ship - 1); y++) {
        if (isValidCoordinate(x, y) && field[y][x].hasShip)
          return false;
      }
    }
    return true;
  };

  this.isPositionAvailable = function() {
    for (var dirIndex = 0; dirIndex < 2; dirIndex++) {
      var multX = dirIndex;
      var multY = 1 - dirIndex;
      for (var initX = 0; initX < size - multX * (ship - 1); initX++) {
        for (var initY = 0; initY < size - multY * (ship - 1); initY++) {
          if (this.isShipPositionFree({
            multX: multX,
            multY: multY,
            initX: initX,
            initY: initY
          })) return true;
        }
      }
    }
    return false;
  }

  function getRandomShipPosition() {
    var dir = Math.random() < 0.5;
    var multX = dir ? 0 : 1;
    var multY = dir ? 1 : 0;
    return {
      multX: multX,
      multY: multY,
      initX: Math.floor(Math.random() * (size - multX * (ship - 1))),
      initY: Math.floor(Math.random() * (size - multY * (ship - 1)))
    }
  }

  function isValidCoordinate(x, y) {
    return isValidIndex(x) && isValidIndex(y);
  }

  function isValidIndex(i) {
    return i >= 0 && i < size;
  }
};

module.exports = FieldPopulator;