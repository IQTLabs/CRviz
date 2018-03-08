import {
  add,
  addIndex,
  aperture,
  concat,
  forEach,
  map,
  last,
  prop,
  reject,
  reverse,
  splitEvery,
  reduce
} from "ramda";

import { packEnclose } from "d3-hierarchy";

/**
 * Pack circles into rows and columns.
 */
const packGrid = (circles) => {
  const rows = toRows(circles);
  placeRows(rows);

  // Recenter everything over the origin
  var enclosingCircle = packEnclose(circles);
  forEach((c) => {
    c.x -= enclosingCircle.x;
    c.y -= enclosingCircle.y
  }, circles);
};

const eachWithIndex = addIndex(forEach);

/**
 * Assign x and y coordinates to rows of circles
 */
const placeRows = (rows) => {
  rows = middleOut(map(middleOut, rows));

  const maxRadii = map(maxRadius, rows);
  const ys = coordinatesForRadii(maxRadii);
  const xs = map(coordinatesForRadii, map(map(prop('r')), rows));

  return eachWithIndex(
    (row, i) =>
      eachWithIndex((node, j) => {
        node.x = xs[i][j];
        node.y = ys[i];
      }, row),
    rows
  );
};

const maxRadius = (row) => {
  return Math.max(...row.map((c) => c.r));
};

// Calculate the coordinates for the given list of radii
// such that circles of these radii sit on the same line without colliding.
// The circles are distributed evenly over the origin.
const coordinatesForRadii = (radii) => {
  const diameters = map((r) => r * 2, radii)
  const size = reduce(add, 0, diameters);

  const first = 0 - size / 2 + radii[0]; // Calculate the first coordinate

  return reduce((coords, [lastRadius, currentRadius]) => {
    return [...coords, last(coords) + lastRadius + currentRadius];
  }, [first], aperture(2, radii))
};

const pickEven = (list) => addIndex(reject)((_, i) => i % 2 === 0, list);
const pickOdd = (list) => addIndex(reject)((_, i) => i % 2 !== 0, list);

/**
/ Re-order items from the middle out, alternating in direction.
/
/ Example:
/ middleOut([1, 2, 3, 4, 5]) //=> [4, 2, 1, 3, 5]
*/
const middleOut = (rows) => {
  const above = pickEven(rows);
  const below = pickOdd(rows);
  return concat(reverse(above), below);
};

const toRows = (circles) => {
  return splitEvery(Math.ceil(Math.sqrt(circles.length)), circles);
};

export default packGrid;
