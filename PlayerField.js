var Field = require('./Field.js');

var PlayerField = function(_name) {
  var name = _name;
  var field = new Field();
  field.populate();

  this.getName = function() {
    return name;
  };

  this.getField = function() {
    return field;
  };
};

module.exports = PlayerField;
