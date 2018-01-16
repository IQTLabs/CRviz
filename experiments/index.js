'use strict';

var deepProp = R.curry(function(props, obj) {
  return R.pipe.apply(null, R.map(R.prop, props))(obj);
});

function getLeaves(nestingNode) {
  if (!nestingNode.values) {
    return nestingNode;
  }
  return R.chain(function(child) {
    if (child.values) {
      return R.chain(getLeaves, child.values)
    } else {
      return child;
    }
  }, nestingNode.values)
}


function nestChildren(groupOrder, children, depth) {
  return R.chain(function(child) {
    if (child.key === 'Unknown') {
      return {
        groupValue: 'Unknown',
        type: groupOrder[depth].join('_'),
        children: R.chain(getLeaves, child.values)
      }
    }
    return [nestingToHierarchy(groupOrder, child, depth + 1)]
  }, children)
}

function nestingToHierarchy(groupOrder, nesting, depth) {
  if (depth === 0) {
    return {
      groupValue: null,
      type: null,
      children: nestChildren(groupOrder, nesting, depth)
    };
  } else if (nesting.values) {
    return {
      groupValue: nesting.key,
      type: groupOrder[depth - 1].join('_'),
      children: nestChildren(groupOrder, nesting.values, depth)
    };
  } else {
    return nesting;
  }
}

function rotate(array, offset) {
  return R.concat(R.drop(offset, array), R.reverse(R.take(offset, array)));
}


// var groupOrder = [['netmask']].concat(rotate([ ['os', 'os'], ['role', 'role']], offset));
var groupOrder = [['netmask'], ['os', 'os'], ['role', 'role']];

function rotateAll() {
  groupOrder = rotate(groupOrder, 1)
}

function rotateChildren() {
  groupOrder = [groupOrder[0]].concat(rotate(R.tail(groupOrder), 1));
}


var hideSmall = true;

function toggleSmall() {
  hideSmall = !hideSmall;
  d3.select('#hideSmall').text(function() {
    return hideSmall ? 'Show small' : 'Hide small';
  });
}


function makeHierarchy() {
  d3.select('#groupOrder').text(R.join(' > ', R.map(R.join('_'), groupOrder)));

  var deepNest = R.reduce(function(nest, currentKey) {
    return nest.key(function(d) { return deepProp(currentKey, d); });
  }, d3.nest())

  var nest = deepNest(groupOrder).entries(DATA);
  var hierarchy = nestingToHierarchy(groupOrder, nest, 0);
  return hierarchy;
}

function render() {

  var width = document.documentElement.clientWidth;

  var height = document.documentElement.clientHeight;

  var svg = d3.select("svg")
    .attr('width', width)
    .attr('height', height)

  var tooltip = d3.select('body')
    .append('pre')
    .attr('class', 'tooltip')

  d3.select('#rotate')
    .on('click', function() {
      rotateAll();
      update(makeHierarchy())
    });

  d3.select('#rotateChildren')
    .on('click', function() {
      rotateChildren();
      update(makeHierarchy())
    });

  d3.select('#changePlacement')
    .on('click', function() {
      changePlacement();
      update(makeHierarchy());
    });

  d3.select('#hideSmall')
    .on('click', function() {
      toggleSmall();
      update(makeHierarchy());
    })

  var rootG = svg
    .append('g')
    .attr('transform', 'translate(' + [width / 2, height / 2].join(',') + ')');

  var g = rootG
    .append('g')

  var boundOverlay = g.append('rect')
    .attr('fill', 'red')
    .attr('fill-opacity', 0.2)

  var selectedNode = null;
  var currentVisible = null;
  var currentView = null;
  var currentHover = null;

  function update(hierarchy) {

    var zoomBehavior = d3.zoom()
      .on('zoom',function() {
        zoomTo(d3.event.transform);
      })

    zoomBehavior.interpolate(d3.interpolate);

    rootG.call(zoomBehavior);

    var root = d3.hierarchy(hierarchy)
      .count()
      .sort(composeComparators([
        function sortByUnknown(a, b) {
          if (a.data.groupValue === 'Unknown') {
            return b.data.groupValue === 'Unknown' ? 0 : 1;
          } else {
            return b.data.groupValue === 'Unknown' ? -1: 0;
          }
        },
        function sortByCount(a, b) {
          return (b.value || 0) - (a.value || 0)
        },
        function sortByName(a, b) {
          return (a.data.groupValue || "").localeCompare(b.data.groupValue || "")
        },
        function sortByIp(a, b) {
          return (a.data["IP"] || "").localeCompare(b.data["IP"] || "");
        }
      ]))

    var pack = packWithLabel()
      // .size([ width, height ])
      .padding(function(d) {
        return 0.001;
        // return Math.log(d.height) * 0.1 + 1;
      });

    var packedRoot = pack(root);

    var quadtree = d3.quadtree(packedRoot.descendants(), R.prop('x'), R.prop('y'));

    var node = g.selectAll('g')
      .data(packedRoot.descendants(), datumKey);

    node.exit().remove();

    node = appendCircle(node, zoom);

    node
      .on('mouseover', function(d) {
        if (d.depth === 0) {
          return;
        }

        currentHover = this;

        showTooltip(tooltip, d, d3.event);

        var k = d3.zoomTransform(rootG.node()).k;

        d3.select(this)
          .select('circle')
          .attr('stroke', 'black')
          .attr('stroke-width', 1 / k)
          .attr('stroke-opacity', '0.5');

      })
      .on('mouseout', function(d) {
        showTooltip(null, d, d3.event);
        tooltip.style('display', 'none')
        currentHover = null;
        d3.select(this)
          .select('circle')
          .attr('stroke', 'transparent')
      })


    if (selectedNode) {
      selectedNode = walkTree(packedRoot, R.map(datumKey, R.reverse(selectedNode.ancestors())))
    } else {
      selectedNode = packedRoot;
    }

    zoom(selectedNode);

    function zoom(d) {
      selectedNode = d;

      var transform = d3.zoomTransform(rootG);

      var size = d.r * 2 * 1.25;
      var k = Math.min(width, height) / size;

      var newTransform = transform
        .scale(k)
        .translate(
          - selectedNode.x,
          - selectedNode.y
        )

      console.log('k', k);
      zoomBehavior.transform(
        rootG.transition().duration(1000),
        newTransform
      )
    }

    function boundFromTransform(transform) {
      var centerX =  0 - transform.x / transform.k
      var centerY =  0 - transform.y / transform.k

      var size = Math.min(width, height) / transform.k;
      var aspectRatio = width / height;
      var boundWidth = size * Math.max(width / height, 1);
      var boundHeight = size * Math.max(height / width, 1);

      var bound = [
        centerX - boundWidth / 2,
        centerY - boundHeight / 2,
        centerX + boundWidth / 2,
        centerY + boundHeight / 2
      ];
      return bound;
    }

    function boundFromNode(d) {
      return [
        d.x - d.r,
        d.y - d.r,
        d.x + d.r,
        d.y + d.r,
      ]
    }

    function boundOverlap(b0, b1) {
      var overlap =
        b0[0] <= b1[2] &&
        b0[2] >= b1[0] &&
        b0[1] <= b1[3] &&
        b0[3] >= b0[1];
      return overlap;
    }

    function zoomTo(transform) {
      g.attr('transform', transform);

      var bound = boundFromTransform(transform);

      d3.select(currentHover)
        .select('circle')
        .attr('stroke-width', 1 / transform.k + 'px');

      var nodeInView = node
        .filter(function(d) {
          var isInView = boundOverlap(bound, boundFromNode(d));
          return isInView;
        })
        nodeInView.style('display', function(d) {
          if (d.r * transform.k < 1) {
            return 'none';
          } else {
            return null;
          }
        });
    }

    // zoomBehavior.extent(

    // )
    // zoomTo(node.transition().duration(500), viewFromFocus(selectedNode));
    // zoom(selectedNode);

    // function zoom(d) {
    //   var newView;
    //   if (Array.isArray(d)) {
    //     selectedNode = null;
    //     newView = d;
    //   } else {
    //     selectedNode = d;
    //     newView = viewFromFocus(d);
    //   }

    //   var hRatio = Math.max(width / height, 1)
    //   var vRatio = Math.max(height / width, 1)

    //   var searchBound = [
    //     newView[0] - (newView[2] * hRatio / 2),
    //     newView[1] - (newView[2] * vRatio/ 2),
    //     newView[0] + (newView[2] * hRatio / 2),
    //     newView[1] + (newView[2] * vRatio/ 2),
    //   ];

    //   var visibleData = searchQuadtree(quadtree, searchBound);


    //   visibleData = R.chain(function(node) {
    //     return [node].concat(node.ancestors());
    //   }, visibleData);


    //   var visibleData = new Set(R.map(datumKey, visibleData));

    //   var targetVisibleNode = node.merge(nodeEnter)
    //     .filter(function(datum) {
    //       return (visibleData.has(datumKey(datum)));
    //     })

    //   // out of view nodes
    //   var hiddenNode = node.merge(nodeEnter)
    //     .filter(function(datum) {
    //       return !(visibleData.has(datumKey(datum)));
    //     })
    //     .style('opacity', 0)
    //     .attr('hidden', true)

    //   if (!currentView) {
    //     zoomTo(targetVisibleNode, newView);
    //     currentView = newView;
    //     currentVisible = targetVisibleNode;
    //     // debugger;
    //   } else {

    //     var nodeToAnimate = currentVisible.filter(function(d) {
    //       return visibleData.has(datumKey(d));
    //     });

    //     var interpolate = d3.interpolateZoom(currentView, newView);
    //     d3.transition()
    //       .duration(interpolate.duration)
    //       .tween('zoom', function() {
    //         return function(t) {
    //           zoomTo(nodeToAnimate, interpolate(t))
    //         }
    //       })
    //       .on('end', function() {
    //         targetVisibleNode
    //           .attr('hidden', null)
    //           .filter(function() {
    //             return Math.max(parseFloat(this.style.opacity), 0) === 0
    //           })
    //           .transition().duration(500)
    //           .style('opacity', 1)
    //         zoomTo(targetVisibleNode, newView);
    //         currentView = newView;
    //         currentVisible = targetVisibleNode;
    //       });
    //   }
    // }

    // Scale and translate the given node(s) for the 'zoom' and 'pan'
    // effect.
    // function zoomTo(node, newView) {
      // var k = Math.min(width, height) / newView[2];
      // var center = [width / 2, height / 2];

      // // currentVisible = node.selection ? node.selection() : node;
      // // currentView = newView;
      // var view = newView;
      // var k = Math.min(width, height) / view[2];

      // var center = [width / 2, height / 2];

      // node
      //   .filter(function(d) {
      //     return d.r * 2 * k >= 2;
      //   })
      //   .attr("transform", function(d) {
      //     return "translate(" + ((d.x - view[0]) * k + center[0]) + "," + ((d.y - view[1]) * k + center[1]) + ")";
      //   });

      // node.attr('hidden', function(d) {
      //   if (d.r * 2 * k < 2) {
      //     return true;
      //   }
      //   return null;
      // });

      // node.select('circle')
      //   .attr("r", function(d) { return d.r * k; })

      // displayLabel(node, newView);

      // node.select('.label-shape')
      //   .attr('d', function(d) {
      //     var top = (d.r - d.labelSize) * k;
      //     var radius = d.r * k;

      //     var startX = 0 - Math.sqrt(radius * radius - top * top);
      //     var startY = top;

      //     var startAngle = Math.PI / 2 + Math.acos(top / radius);
      //     var endAngle = Math.PI / 2 - Math.acos(top / radius);

      //     var shape = d3.path();
      //     shape.arc(0, 0, radius, startAngle, endAngle, true);
      //     shape.closePath();
      //     return shape.toString();
      //   })
    // }

    function displayLabel(node, newView) {
      var k = Math.min(width, height) / newView[2];

      node.select('.label')
        .attr('data-y', function(d) {
          return d.r * k - (d.labelSize * k) / 2;
        })
        .attr('y', function calcLabelPos(d) {
          return d.r * k - (d.labelSize * k) / 2;
        })
        .attr('pointer-events', 'none')
        .text(function calcLabelOpacity(d) {
          var labelText = d.data.groupValue;
          var $this = d3.select(this);
          var radius = d.r * k;
          var bottom = parseFloat($this.attr('data-y'));
          var chordLength = 2 * Math.sqrt(radius * radius - bottom * bottom)
          return fitText(this, labelText, chordLength * 0.75);
        })
        .attr('hidden', function(d) {
          return (d.labelSize * k) > measureText(this)[1] ? null : true;
        })
    }
  }

  changePlacement();
  update(makeHierarchy());
}

render();
