var expect = require('expect');
var Field = require('../Field');

var SIZE = 10;

describe('Field', function () {
  describe('new', function () {
    var field, boxes;

    beforeEach(function () {
      field = new Field();
      boxes = field.get();
    });

    it('should be a square of 10 boxes', function () {
      expect(boxes.length).toBe(SIZE);
      boxes.forEach(function (row) {
        expect(row.length).toBe(SIZE);
      });
    });

    it('should have all boxes properly initialized', function () {
      var expectedY = 0;
      boxes.forEach(function (row) {
        var expectedX = 0;
        row.forEach(function (box) {
          expect(box.x).toBe(expectedX);
          expect(box.y).toBe(expectedY);
          expect(box.hasShip).toBe(false);
          expect(box.wasShot).toBe(false);
          expectedX++;
        })
        expectedY++;
      });
    });
  });

  describe('#populate', function () {
    var field, boxes;

    beforeEach(function () {
      field = new Field();
      field.populate();
      boxes = field.get();
    });

    it('should contain 4 ships of size 2', function () {
      expect(countShips(2)).toBe(4);
    });

    it('should contain ships of size 3, 4 and 5', function () {
      expect(countShips(3)).toBe(3);
      expect(countShips(4)).toBe(2);
      expect(countShips(5)).toBe(1);
    });

    it('should contain 30 populated boxes', function() {
      var numBoxes = 0;
      boxes.forEach(function (row) {
        row.forEach(function (box) {
          if (box.hasShip)
            numBoxes++;
        });
      });
      expect(numBoxes).toBe(30);
    });

    function countShips(size) {
      var numShips = 0;
      boxes.forEach(function (row) {
        row.forEach(function (box) {
          if (containsShipFromBox(size, box))
            numShips++;
        });
      });
      return numShips;

      function containsShipFromBox(size, box) {
        return containsShipOnRow() || containsShipOnColumn();

        function containsShipOnRow() {
          if (shipString(box.x - 1, box.x - 1, box.y - 1, box.y + 1) != 'ooo')
            return false;
          if (shipString(box.x + size, box.x + size, box.y - 1, box.y + 1) != 'ooo')
            return false;
          for (var i = 0; i < size; i++) {
            if (shipString(box.x + i, box.x + i, box.y - 1, box.y + 1) != 'oxo')
              return false;
          }
          return true;
        }

        function containsShipOnColumn() {
          if (shipString(box.x - 1, box.x + 1, box.y - 1, box.y - 1) != 'ooo')
            return false;
          if (shipString(box.x - 1, box.x + 1, box.y + size, box.y + size) != 'ooo')
            return false;
          for (var i = 0; i < size; i++) {
            if (shipString(box.x - 1, box.x + 1, box.y + i, box.y + i) != 'oxo')
              return false;
          }
          return true;
        }

        function shipString(x1, x2, y1, y2) {
          var string = '';
          for (var x = x1; x <= x2; x++) {
            for (var y = y1; y <= y2; y++) {
              string += hasShip(x, y) ? 'x' : 'o';
            }
          }
          return string;
        }

        function hasShip(x, y) {
          return isValidIndex(x) && isValidIndex(y) && boxes[y][x].hasShip;
        }

        function isValidIndex(offset) {
          return offset >= 0 && offset < SIZE;
        }
      }
    }
  });
});
