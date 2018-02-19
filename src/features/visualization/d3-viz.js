import { select } from 'd3-selection';
import { find, reverse, reduced, reduce, tail, reduceWhile } from 'ramda';

import packWithLabel from './d3-viz/pack-with-label';
import toHierarchy from './d3-viz/to-hierarchy';
import appendCircles from './d3-viz/append-circles';
import setupZoom from './d3-viz/setup-zoom';
import datumKey from './d3-viz/datum-key';

function d3Viz(rootNode) {

  const root = select(rootNode);
  const width = rootNode.clientWidth;
  const height = rootNode.clientHeight;

  const svg = root.append('svg')
    .style('width', '100%')
    .style('height', '100%')

  const zoomRoot = svg.append('g');
  zoomRoot
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', 'transparent')
    .attr('width', width)
    .attr('height', height)

  const circleRoot = zoomRoot.append('g');

  let selectedNode = null;

  function update({ hierarchyConfig, data }) {

    const hierarchy = makeHierarchy(data, hierarchyConfig);
    const pack = packWithLabel().padding(0.001);
    pack(hierarchy);

    const nodes = appendCircles({
      root: circleRoot,
      packedData: hierarchy
    });

    const zoom = setupZoom({
      zoomRoot: zoomRoot,
      nodeRoot: circleRoot,
      nodes: nodes,
      width: width,
      height: height,
      packedData: hierarchy
    })

    if (selectedNode) {
      selectedNode = findLowestAncestors(selectedNode, hierarchy);
    } else {
      selectedNode = hierarchy;
    }

    zoom.zoomTo(selectedNode);

    nodes.on('click.select', (d) => {
      selectedNode = d;
      zoom.zoomTo(d);
    });
  }

  return {
    update
  }
}

const makeHierarchy = (data, hierarchyConfig) => {
  return toHierarchy(data, hierarchyConfig)
    .count()
    .sort(composeComparators([
      // Unknown goes last
      (a, b) => {
        if (a.data.fieldValue === 'Unknown') {
          return b.data.fieldValue === 'Unknown' ? 0 : 1;
        } else {
          return b.data.fieldValue === 'Unknown' ? -1: 0;
        }
      },

      // Larger groups go before smaller groups
      (a, b) => (b.value || 0) - (a.value || 0),

      // Sort by name
      (a, b) => (a.data.fieldValue || "").localeCompare(b.data.fieldValue || "")
    ]))

}


/**
 * Combine a list of comparator function ( (a, b) => Boolean )
 * in order into a single comparator.
*/
const composeComparators = (comparators) =>  (a, b) => (
  reduceWhile(
    (result) => result === 0, // keep comparing while a === b
    (_, comparator) => comparator(a, b),
    0,
    comparators
  )
);

/**
 * Find the lowest ancestors of a node (or it self) that exists in a tree.
 */
const findLowestAncestors = (node, hierarchy) => {
  const path = reverse(node.ancestors());
  const findChild = (parent, child) => (
    find((c) => datumKey(c) === datumKey(child), parent.children || [])
  );

  return reduce((last, child) => findChild(last, child) || reduced(last), node, tail(path))
}

export default d3Viz;
