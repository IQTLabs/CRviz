import { select, event as d3Event } from 'd3-selection';
import { find, reverse, reduced, reduce, tail, reduceWhile } from 'ramda';

import packWithLabel from './d3-viz/pack-with-label';
import toHierarchy from './d3-viz/to-hierarchy';
import appendCircles from './d3-viz/append-circles';
import setupZoom from './d3-viz/setup-zoom';
import setupTooltip from './d3-viz/setup-tooltip';
import datumKey from './d3-viz/datum-key';

function d3Viz(rootNode) {

  const root = select(rootNode);
  const width = rootNode.clientWidth;
  const height = rootNode.clientHeight;

  /**
   * Stationary div that receive mouse events for zooming.
   */
  const zoomRoot = root.append('div')
    .style('width', '100%')
    .style('height', '100%')

  root.style('position', 'relative');

  /**
   * The container that is scaled and transformed.
   *
   * Use a div with CSS 3D transform to get hardware acceleration.
   * SVG transform are not hardware accelerated.
   */
  const transformRoot = zoomRoot.append('div')
    .style('position', 'absolute')
    .style('top', 0)
    .style('left', 0)
    .style('width', width)
    .style('height', height)
    .style('transform-origin', 'top left')

  /**
   * Label are placed in a separate element so that they are not scaled
   * together with the circles.
   */
  const labelRoot = zoomRoot.append('svg')
    .style('position', 'absolute')
    .style('pointer-events', 'none') // Let the underlying circles get mouse events.
    .style('top', 0)
    .style('left', 0)
    .style('width', width)
    .style('height', height)

  const svg = transformRoot.append('svg').style('overflow', 'visible')

  const tooltip = root.append('div').classed('viz-tooltip', true);

  const nodeRoot = svg.append('g');

  let selectedNode = null;

  function update({ hierarchyConfig, fields, data }) {

    const hierarchy = makeHierarchy(data, hierarchyConfig);
    const pack = packWithLabel()
      .padding(Math.floor(Math.min(width, height) / 500))
      .size([width, height]);

    pack(hierarchy);

    const [ nodes, labels ]= appendCircles({
      nodeRoot: nodeRoot,
      labelRoot: labelRoot,
      packedData: hierarchy
    });

    const zoom = setupZoom({
      zoomRoot: zoomRoot,
      transformRoot: transformRoot,
      nodes: nodes,
      labels: labels,
      width: width,
      height: height,
      packedData: hierarchy
    });

    setupTooltip({
      tooltip: tooltip,
      fields: fields,
      nodeRoot: nodeRoot
    });

    if (selectedNode) {
      selectedNode = findLowestAncestors(selectedNode, hierarchy);
    } else {
      selectedNode = hierarchy;
    }

    zoom.zoomTo(selectedNode);

    nodeRoot.on('click.select', () => {
      const datum = select(d3Event.target).datum();
      zoom.zoomTo(datum);
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
