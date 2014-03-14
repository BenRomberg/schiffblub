var expect = require('expect');
var Box = require('../Box');
var FieldPopulator = require('../FieldPopulator');

describe('FieldPopulator', function () {
  describe('#isShipPositionFree', function () {
    it('says that a singular clean field is free', function () {
      var populator = new FieldPopulator(initField(1), 1);
      var position = {
        initX: 0,
        initY: 0,
        multX: 0,
        multY: 1
      }
      expect(populator.isShipPositionFree(position)).toBe(true);
    });

    it('says that a singular populated field is taken', function () {
      var field = initField(1);
      field[0][0].hasShip = true;
      var populator = new FieldPopulator(field, 1);
      var position = {
        initX: 0,
        initY: 0,
        multX: 0,
        multY: 1
      }
      expect(populator.isShipPositionFree(position)).toBe(false);
    });

    it('says that a 3 ship in a clean field is free', function () {
      var populator = new FieldPopulator(initField(3), 3);
      var position = {
        initX: 1,
        initY: 0,
        multX: 0,
        multY: 1
      }
      expect(populator.isShipPositionFree(position)).toBe(true);
    });

    it('says that a 3 ship in a populated position field is taken', function () {
      var field = initField(3);
      field[1][1].hasShip = true;
      var populator = new FieldPopulator(field, 3);
      var position = {
        initX: 1,
        initY: 0,
        multX: 0,
        multY: 1
      }
      expect(populator.isShipPositionFree(position)).toBe(false);
    });

    it('says that a 3 ship in a populated neighboring field is taken', function () {
      var field = initField(3);
      field[1][0].hasShip = true;
      var populator = new FieldPopulator(field, 3);
      var position = {
        initX: 1,
        initY: 0,
        multX: 0,
        multY: 1
      }
      expect(populator.isShipPositionFree(position)).toBe(false);
    });

    it('says that a 2 ship in a populated neighboring field is taken', function () {
      var field = initField(4);
      field[1][1].hasShip = true;
      field[3][2].hasShip = true;
      var populator = new FieldPopulator(field, 2);
      var position = {
        initX: 0,
        initY: 0,
        multX: 0,
        multY: 1
      }
      expect(populator.isShipPositionFree(position)).toBe(false);
    });

    it('says that a 2 ship in a sparsely populated field is free', function () {
      var field = initField(4);
      field[1][1].hasShip = true;
      field[3][2].hasShip = true;
      var populator = new FieldPopulator(field, 2);
      var position = {
        initX: 3,
        initY: 0,
        multX: 0,
        multY: 1
      }
      expect(populator.isShipPositionFree(position)).toBe(true);
    });

    it('says that a bigger ship in a populated head field is taken', function () {
      var field = initField(3);
      field[0][0].hasShip = true;
      var populator = new FieldPopulator(field, 2);
      var position = {
        initX: 1,
        initY: 1,
        multX: 0,
        multY: 1
      }
      expect(populator.isShipPositionFree(position)).toBe(false);
    });
  });

  describe('#populate', function () {
    it('should be able to place a 1 ship into a singular clean field', function () {
      var field = initField(1);
      var populator = new FieldPopulator(field, 1);
      populator.populate();
      expect(fieldToString(field)).toBe('x');
    });

    it('should be able to place a 1 ship into a 3 field with only 1 possibility', function () {
      var field = initField(3);
      field[0][0].hasShip = true;
      field[0][1].hasShip = true;
      field[2][0].hasShip = true;
      var populator = new FieldPopulator(field, 1);
      populator.populate();
      expect(fieldToString(field)).toBe('xxo ooo xox');
    });

    it('should be able to place a 2 ship into a 4 field with only 1 possibility', function() {
      var field = initField(4);
      field[1][1].hasShip = true;
      field[3][2].hasShip = true;
      var populator = new FieldPopulator(field, 2);
      populator.populate();
      expect(fieldToString(field)).toBe('ooox oxox oooo ooxo');
    });

    it('should be able to abort if there is no possibility', function() {
      var field = initField(2);
      field[0][0].hasShip = true;
      var populator = new FieldPopulator(field, 1);
      expect(populator.populate).toThrow('no position available');
    });
  });

  function initField(size) {
    var field = [];
    for (var i = 0; i < size; i++) {
      field[i] = [];
      for (var j = 0; j < size; j++) {
        field[i][j] = new Box(i, j);
      }
    }
    return field;
  }

  function fieldToString(field) {
    var string = '';
    field.forEach(function (row) {
      if (string !== '')
        string += ' ';
      row.forEach(function (box) {
        string += box.hasShip ? 'x' : 'o';
      });
    });
    return string;
  }
});