(function() {
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

  // var groupOrder = [['netmask'], ['os', 'os'], ['role', 'role']];

  function rotateAll() {
    groupOrder = rotate(groupOrder, 1)
  }

  function rotateChildren() {
    groupOrder = [groupOrder[0]].concat(rotate(R.tail(groupOrder), 1));
  }

  function makeHierarchy() {
    var deepNest = R.reduce(function(nest, currentKey) {
      return nest.key(function(d) { return deepProp(currentKey, d); });
    }, d3.nest())

    var nest = deepNest(groupOrder).entries(DATA);
    var hierarchy = nestingToHierarchy(groupOrder, nest, 0);
    return hierarchy;
  }

  function render() {

    var svg = d3.select("svg")

    var width = svg.node().clientWidth;
    var height = svg.node().clientHeight;

    var tooltip = d3.select('body')
      .append('pre')
      .attr('class', 'tooltip')

    var rootG = svg
      .append('g')

    var rect = rootG // Ensure the bound of rootG is always within the viewport
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', 'transparent')
      .attr('width', width)
      .attr('height', height)

    var g = rootG
      .append('g')

    var selectedNode = null;
    var currentVisible = null;
    var currentView = null;
    var currentHover = null;


    window.updateLayout = function updateLayout() {

      var hierarchy = makeHierarchy();

      var zoomBehavior = d3.zoom()
        .on('zoom',function() {
          zoomTo(d3.event.transform);
        })

      zoomBehavior.interpolate(d3.interpolateZoom);

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
        ]))

      var pack = packWithLabel()
        // .size([ width, height ])
        .padding(function(d) {
          return 0.001
        });

      var packedRoot = pack(root);

      var r = packedRoot.r;
      var x = packedRoot.x;
      var y = packedRoot.y;

      var scaleExtent = [
        Math.min(width, height) / (packedRoot.r * 2 * 1.25),
        Math.min(width, height) / (packedRoot.leaves()[0].r * 2 * 1.25)
      ]

      zoomBehavior
        .translateExtent(
          [
            [
              x - (width / 2 / scaleExtent[0]) * 2,
              y - (height / 2 / scaleExtent[0]) * 2
            ],
            [
              x + (width / 2 / scaleExtent[0]) * 2,
              y + (height / 2 / scaleExtent[0]) * 2
            ]
          ]
        )
        .scaleExtent(scaleExtent)

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

      var labelFontSpec = 0;
      var labelMinHeight  = 0;

      if (d3.select('.label').size() > 0) {
        labelFontSpec = getFontSpec(d3.select('.label').nodes()[0]);
        labelMinHeight  = measureText(labelFontSpec, 'M')[0] * 0.75;
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
            - selectedNode.x + width / 2 / k,
            - selectedNode.y + height / 2 / k
          )

        zoomBehavior.transform(
          rootG.transition().duration(1000),
          newTransform
        )
      }

      function boundFromTransform(transform) {
        var size = Math.min(width, height);
        var boundWidth = size * Math.max(width / height, 1);
        var boundHeight = size * Math.max(height / width, 1);

        var bound = [
          -transform.x / transform.k,
          -transform.y / transform.k,
          (-transform.x + boundWidth) / transform.k,
          (-transform.y + boundHeight) / transform.k,
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
        d3.select(currentHover)
          .select('circle')
          .attr('stroke-width', 1 / transform.k + 'px');

        var bound = boundFromTransform(transform);

        var nodeInView = node
          .filter(function(d) {
            var isInView = boundOverlap(bound, boundFromNode(d));
            return isInView;
          })

        nodeInView.attr('display', function(d) {
          if (d.r * transform.k < 1) {
            return 'none';
          } else {
            return null;
          }
        });

        nodeInView.select('.label')
          .attr('display', function d(d) {
            return d.labelSize * transform.k > labelMinHeight ? 'inline' : 'none';
          })
          .filter(function(d) {
            return d.labelSize * transform.k > labelMinHeight
          })
          .text(function setLabelText(d) {
            var labelText = d.data.groupValue + " | " + d.value;
            return fitText(labelFontSpec, labelText, d.labelWidth * transform.k * 0.9);
          })
          .attr('transform', function moveLabel(d) {
            return d3.zoomIdentity
              .translate(0, d.labelX)
              .scale(1 / transform.k)
          })
      }
    }
  }

  render();
}());


window.update = function() {
  updateHierarchyControl();
  updateLayout();
}

update();
