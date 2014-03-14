var Field = require('./Field.js');

var PlayerField = function(_player) {
  var player = _player;
  var field = new Field();
  var ready = false;
  field.populate();

  this.getName = function() {
    return player.name;
  };

  this.getPlayer = function() {
    return player;
  }

  this.getField = function() {
    return field;
  };

  this.isReady = function() {
    return ready;
  };

  this.confirmReady = function() {
    ready = true;
  };

  this.repopulate = function() {
    field = new Field();
    field.populate();
  }
};

module.exports = PlayerField;
