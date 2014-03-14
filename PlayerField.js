var Field = require('./Field.js');

var PlayerField = function(_name) {
  var name = _name;
  var field = new Field();
  var ready = false;
  field.populate();

  this.getName = function() {
    return name;
  };

  this.getField = function() {
    return field;
  };

  this.isReady = function() {
    return ready;
  }

  this.confirmReady = function() {
    ready = true;
  }

  this.repopulate = function() {
    field = new Field();
    field.populate();
  }
};

module.exports = PlayerField;
