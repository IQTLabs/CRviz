(function() {
  window.packSiblings = function packSiblings(circles) {
    var internalNodes = R.filter(R.propSatisfies(R.lt(0), 'height'), circles);
    var leaves = R.filter(R.propEq('height', 0), circles);
    var rows = toRows(internalNodes).concat(toRows(leaves));

    // if (internalNodes.length === 0) {
    //   d3.packSiblings(leaves);
    //   return;
    // }

    R.addIndex(R.forEach)(function(row, i) {
      R.forEach(function(c) {
        c.row = i;
      }, row)
    }, rows);

    placeRowsRigid(rows);

    var enclosing = d3.packEnclose(circles);
    R.forEach(function(circle) {
      circle.x -= enclosing.x
      circle.y -= enclosing.y
    }, circles)
  }

  function toRows(circles) {
    if (R.isEmpty(circles)) {
      return [];
    } else {
      var perRow = Math.ceil(Math.sqrt(circles.length));
      return R.splitEvery(perRow, circles);
    }
  }

  function placeRowsRigid(rows) {
    placeRowRigid(null, rows[0], false);

    if (rows.length > 1) {
      R.addIndex(R.forEach)(function(pair, index) {
        var last = pair[0];
        var current = pair[1];
        placeRowRigid(last, current, index % 2 === 0);
      }, middleOut(rows));
    }
  }


  function placeRowsCompact(rows) {
    placeRow(null, rows[0], false);

    if (rows.length > 1) {
      R.addIndex(R.forEach)(function(pair, index) {
        var last = pair[0];
        var current = pair[1];
        placeRow(last, current, index % 2 === 0);
      }, middleOut(rows));
    }

  }

  function placeRow(lastRow, row, placeBelow) {
    placeRowH(row);
    placeRowV(lastRow, row, placeBelow)
  }

  function placeRowRigid(lastRow, row, placeBelow) {
    placeRowH(row);
    placeRowRigidV(lastRow, row, placeBelow);
  }

  function placeRowH(row) {
    row[0].x = 0;
    if (row.length > 1) {
      R.addIndex(R.forEach)(
        function(pair, index) {
          var placeLeft = index % 2 === 1;
          var offset = pair[0].r + pair[1].r;
          var x = pair[0].x + (placeLeft ? 0 - offset : offset)
          pair[1].x = pair[0].x + (placeLeft ? 0 - offset : offset)
        },
        middleOut(row)
      );
    }

    // Recenter every thing
    var width = R.sum(R.map(function(c) { return c.r * 2 }, row));
    var leftMost = (row.length + 1) % 2 === 0 ? R.last(row) : row[row.length - 2];
    var leftBound = leftMost.x - leftMost.r;
    var offset = (0 - width / 2) - leftBound;
    R.forEach(function(c) { c.x += offset  }, row);
  }

  var overlapVertically = R.curry(function(c1, c2) {
    return Math.abs(c1.x - c2.x) < (c1.r + c2.r);
  });

  // The y coordinate for the circle to have to avoid overlaping
  var yCoordinate = R.curry(function(circle, placeBelow, target) {
    var dx = circle.x - target.x;
    var hyp = circle.r + target.r;
    var dy = Math.sqrt(hyp*hyp - dx*dx);

    return target.y + dy * (placeBelow ? 1 : -1);
  });

  // Place each node in `row` close to the last row
  // without overlapping
  function placeRowV(lastRow, row, placeBelow) {
    if (lastRow === null) {
      R.forEach(function(c) { c.y = 0 }, row);
      return;
    }

    R.forEach(
      function(circle) {
        var overlappingCircles = R.filter(overlapVertically(circle), lastRow)
        if (overlappingCircles.length === 0) {
          yCoord = R.reduce(R.minBy(function(c) {
            return Math.abs(c.x - circle.x);
          }), lastRow[0], lastRow).y + circle.r * (placeBelow ? 1 : -1)
        } else {
          var yCoord = (placeBelow ? Math.max : Math.min).apply(null, R.map(yCoordinate(circle, placeBelow), overlappingCircles));
          if (yCoord === Infinity) {
            debugger;
          }
        }
        circle.y = yCoord;
      },
      row
    );
  }

  function placeRowRigidV(lastRow, row, placeBelow) {
    if (lastRow === null) {
      R.forEach(function(c) { c.y = 0 }, row)
      return;
    }
    var getMaxRadius = R.compose(R.reduce(R.max, 0), R.map(R.prop('r')));
    var maxRadius = getMaxRadius(row);
    var lastRowMaxRadius = getMaxRadius(lastRow);
    var lastY = lastRow[0].y
    var offset = lastRowMaxRadius + maxRadius;
    var y = 0;
    if (placeBelow) {
      y = lastY + offset;
    } else {
      y = lastY - offset;
    }

    R.forEach(function(c) { c.y = y }, row);
  }

  /*
   * Re-order items in an array middle out.
   * Returning an array of pairs of items that are adjacent to each other.
   * The first item in the pair precede the second.
   *
   * middleOut([r1, r2, r3, r4, r5])
   * => [[r1,r2], [r1,r3], [r2, r4], [r3, r5]]
   */
  function middleOut(items) {
    if (items.length < 3) {
      return [items]
    } else {
      var len = items.length
      var current = items[len - 1]
      var last = items[len - 3]
      return middleOut(items.slice(0, len - 1)).concat([[last, current]])
    }
  }
}())
