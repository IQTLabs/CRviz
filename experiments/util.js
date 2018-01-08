function searchQuadtree(quadtree, bound) {
  var result = [];

  quadtree.visit(function(treeNode, x0, y0, x1, y1) {
    if (!treeNode.length) {
      var data = treeNode.data;
      var isInBound =
        data.x >= bound[0] &&
        data.x <= bound[2] &&
        data.y >= bound[1] &&
        data.y <= bound[3];

      if (isInBound) {
        result.push(data);
      }

      return false;
    }

    var nonOverlap =
      x1 < bound[0] ||
      x0 > bound[2] ||
      y1 < bound[1] ||
      y0 > bound[3];

    return nonOverlap;
  });

  return result;
}

function viewFromFocus(d) {
  return [d.x, d.y, d.r * 2 * 1.25]
}

function appendCircle(node) {
  var circle = node
    .append("circle")
    .attr("r", function(d) { return d.r; })
    .on('mouseover', function() {
      d3.select(this)
        .attr('stroke', 'black')
        .attr('stroke-opacity', '0.5');
    })
    .on('mouseout', function() {
      d3.select(this).attr('stroke', 'transparent')
    });

  node
    .filter(function(d) { return d.depth >= 1 && d.height > 0; })
    .append('path')
    .attr('class', 'label-shape')
    .attr('fill', 'black')
    .attr('fill-opacity', 0.5)

  node
    .filter(function(d) { return d.depth >= 1 && d.height > 0; })
    .append('text')
    .attr('class', 'label')
    .attr('font-family', 'monospace')
    .attr('font-size', '12px')
    .attr('fill', 'white')
    .attr('text-anchor', 'middle')
    .text(function(d) { return d.data.groupValue + " | "+ d.value })

  circle.filter(function(d) { return d.height === 0 })
    .attr('class', function() { return 'devices' })
    .attr('fill', 'black')
    .attr('fill-opacity', '1')
    .attr('stroke-width', '0px')

  circle.filter(function(d) { return d.depth === 0 })
    .attr('fill', 'transparent')
    .attr('fill-opacity', '0.1')
    .attr('stroke-width', '0px')

  circle.filter(function(d) { return d.depth > 0 && d.height > 0 })
    .attr('fill', function(d) { return d.data.groupValue === 'Unknown' ? 'red' : 'black' })
    .attr('fill-opacity', function(d) { return d.data.groupValue === 'Unknown' ? 0.5 : 0.1 })
    .attr('stroke-width', 1)
}



var groupName = function(d) {
  return R.reject(R.isNil, [
    d.parent ? groupName(d.parent) : null,
    d.data.uid || d.data.groupValue || 'root'
  ]).join('_');
};

function datumKey(datum) {
  // return the key used to identify data
  return groupName(datum);
}

/*
 * Walk down the tree according to the provided path
 *
 * path: an array of node keys that represents the children that
 * should be visited at each level.
 */
function walkTree(root, path) {
  var currentKey = datumKey(root)
  if (path.length === 0 || path[0] !== currentKey) {
    return null; // Nothing to walk
  }

  var remain = R.tail(path);

  if (!root.children || remain.length === 0) {
    return root;
  }

  var next = R.find(
    R.compose(R.equals(remain[0]), datumKey),
    root.children
  );

  if (next === undefined) {
    return root;
  } else {
    return walkTree(next, remain);
  }
}

window.composeComparators = function(comparators) {
  return function(a, b) {
    return R.reduceWhile(
      function(acc) { return acc === 0 },
      function(acc, comparator) {
        return comparator(a, b);
      },
      0,
      comparators
    );
  }
}
