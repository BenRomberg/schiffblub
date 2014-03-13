var Box = function (i, j) {
  this.x = j;
  this.y = i;
  this.hasShip = false;
  this.wasShot = false;
};

module.exports = Box;