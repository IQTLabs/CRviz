import { select, event as d3Event } from 'd3-selection';
import {
  allPass,
  eqProps,
  find,
  map,
  reduce,
  reduceWhile,
  reduced,
  reverse,
  tail,
} from 'ramda';

import packWithLabel from './d3-viz/pack-with-label';
import toHierarchy from './d3-viz/to-hierarchy';
import appendCircles from './d3-viz/append-circles';
import setupZoom from './d3-viz/setup-zoom';
import setupTooltip from './d3-viz/setup-tooltip';
import setupLegend from './d3-viz/setup-legend';
import datumKey from './d3-viz/datum-key';

function d3Viz(rootNode) {

  const root = select(rootNode);
  const width = rootNode.clientWidth;
  const height = rootNode.clientHeight;

  /**
   * Stationary div that receive mouse events for zooming.
   */
  const zoomRoot = root.append('div')
    .style('position', 'relative')
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
    .attr('data-node', 'transformRoot')
    .style('position', 'absolute')
    .style('top', 0)
    .style('left', 0)
    .style('width', '100%')
    .style('height', '100%')
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
    .style('width', '100%')
    .style('height', '100%')

  const svg = transformRoot.append('svg').style('overflow', 'visible')

  const tooltip = root.append('div').classed('viz-tooltip', true);
  const legend = root.append('div').classed('viz-legend', true);

  const nodeRoot = svg.append('g');

  // State
  let props = {
    hierarchyConfig: null,
    data: null,
    fields: null,
    width: null,
    height: null,
    showNodes: true,
    coloredField: null,
  };

  const state = {
    packedData: null,
    nodes: null,
    labels: null,
    countLabels: null,
    zoom: null,
    selectedNode: null
  }

  // function update({ hierarchyConfig, data, fields, width, height, showNodes, coloredField }) {
  function update(nextProps) {
    let dataUpdated = false,
        sizeUpdated = false;

    // const { hierarchyConfig, data, fields, width, height, showNodes, coloredField } = nextProps;

    dataUpdated = !allEqProps(['hierarchyConfig', 'data', 'fields'], props, nextProps);
    sizeUpdated = !allEqProps(['width', 'height'], props, nextProps);

    props = nextProps;

    if (dataUpdated) {
      repack(props, state)
    }

    rerender(props, state);

    if (sizeUpdated || dataUpdated) {
      resetZoom(props, state);
    }
  }

  const repack = (props, state) => {
    const hierarchy = makeHierarchy(props.data, props.hierarchyConfig);

    const pack = packWithLabel()
      .size([width, height])
      .padding((d) => d.height / hierarchy.height * 15)

    state.packedData = pack(hierarchy);

    if (state.selectedNode) {
      state.selectedNode = findLowestAncestors(state.selectedNode, state.packedData);
    } else {
      state.selectedNode = state.packedData;
    }
  };

  const allEqProps = (props, o1, o2) => {
    return allPass(map(eqProps, props))(o1, o2);
  }

  const rerender = (props, state) => {
    const [nodes, labels, countLabels] = appendCircles({
      nodeRoot: nodeRoot,
      labelRoot: labelRoot,
      packedData: state.packedData,
      showNodes: props.showNodes
    });

    setupTooltip({
      tooltip: tooltip,
      fields: props.fields,
      nodeRoot: nodeRoot
    });

    setupLegend({
      legend: legend,
      hierarchyConfig: props.hierarchyConfig,
      nodes: nodes,
      data: props.data,
      coloredField: props.coloredField
    });

    state.nodes = nodes;
    state.labels = labels;
    state.countLabels = countLabels;
  };

  const resetZoom = (props, state) => {
    state.zoom = setupZoom({
      zoomRoot: zoomRoot,
      transformRoot: transformRoot,
      nodes: state.nodes,
      labels: state.labels,
      countLabels: state.countLabels,
      width: width,
      height: height,
      packedData: state.packedData
    });

    if (state.selectedNode) {
      state.zoom.zoomTo(state.selectedNode);
    }

    nodeRoot.on('click.select', () => {
      const datum = select(d3Event.target).datum();
      state.zoom.zoomTo(datum);
    });
  };


  // Update
  // Check which part of the state has changed

  // pack - render - zoom

  // render - zoom

  // render

  // function pack() {
  //   const hierarchy = makeHierarchy(data, hierarchyConfig);

  //   const pack = packWithLabel()
  //     .size([width, height])
  //     .padding((d) => d.height / hierarchy.height * 15)

  //   pack(hierarchy);
  // }

  // function zoom111() {

  //   render();

  //   const zoom = setupZoom({
  //     zoomRoot: zoomRoot,
  //     transformRoot: transformRoot,
  //     nodes: nodes,
  //     labels: labels,
  //     countLabels: countLabels,
  //     width: width,
  //     height: height,
  //     packedData: hierarchy
  //   });

  //   zoom.zoomTo(selectedNode);
  // }

  // function render() {
  //   const [ nodes, labels, countLabels ] = appendCircles({
  //     nodeRoot: nodeRoot,
  //     labelRoot: labelRoot,
  //     packedData: hierarchy,
  //     showNodes: showNodes
  //   });

  //   setupTooltip({
  //     tooltip: tooltip,
  //     fields: fields,
  //     nodeRoot: nodeRoot
  //   });

  //   setupLegend({
  //     legend: legend,
  //     hierarchyConfig: hierarchyConfig,
  //     nodes: nodes,
  //     data: data,
  //     coloredField: coloredField
  //   })

  // }

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
