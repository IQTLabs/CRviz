import { select, event as d3Event } from "d3-selection";

import { ResizeSensor } from "css-element-queries";
import debounce from "lodash.debounce";

import {
  allPass,
  eqProps,
  eqBy,
  find,
  map,
  reduce,
  reduceWhile,
  reduced,
  reverse,
  tail
} from "ramda";

import packWithLabel from "./d3-viz/pack-with-label";
import toHierarchy from "./d3-viz/to-hierarchy";
import appendCircles from "./d3-viz/append-circles";
import setupZoom from "./d3-viz/setup-zoom";
import setupTooltip from "./d3-viz/setup-tooltip";
import setupLegend from "./d3-viz/setup-legend";
import datumKey from "./d3-viz/datum-key";

function d3Viz(rootNode) {
  const root = select(rootNode);
  // const width = rootNode.clientWidth;
  // const height = rootNode.clientHeight;

  /**
   * Stationary div that receive mouse events for zooming.
   */
  const zoomRoot = root
    .append("div")
    .style("position", "relative")
    .style("width", "100%")
    .style("height", "100%");

  root.style("position", "relative");

  /**
   * The container that is scaled and transformed.
   *
   * Use a div with CSS 3D transform to get hardware acceleration.
   * SVG transform are not hardware accelerated.
   */
  const transformRoot = zoomRoot
    .append("div")
    .attr("data-node", "transformRoot")
    .style("position", "absolute")
    .style("top", 0)
    .style("left", 0)
    .style("width", "100%")
    .style("height", "100%")
    .style("transform-origin", "top left");

  /**
   * Label are placed in a separate element so that they are not scaled
   * together with the circles.
   */
  const labelRoot = zoomRoot
    .append("svg")
    .style("position", "absolute")
    .style("pointer-events", "none") // Let the underlying circles get mouse events.
    .style("top", 0)
    .style("left", 0)
    .style("width", "100%")
    .style("height", "100%");

  const svg = transformRoot.append("svg").style("overflow", "visible");

  const tooltip = root.append("div").classed("viz-tooltip", true);
  const legend = root.append("div").classed("viz-legend", true);

  const nodeRoot = svg.append("g");

  // State
  let props = {
    hierarchyConfig: null,
    data: null,
    fields: null,
    width: rootNode.clientWidth,
    height: rootNode.clientHeight,
    showNodes: true,
    coloredField: null
  };

  const state = {
    packedData: null,
    nodes: null,
    labels: null,
    countLabels: null,
    zoom: null,
    selectedNode: null,
    legend: null
  };

  new ResizeSensor(rootNode, debounce(() => update(props), 100));

  function update(nextProps) {
    nextProps = {
      ...nextProps,
      width: rootNode.clientWidth,
      height: rootNode.clientHeight
    };

    const dataUpdated = !allEqProps(
      ["hierarchyConfig", "data", "fields"],
      props,
      nextProps
    );

    const sizeUpdated = !allEqProps(["width", "height"], props, nextProps);

    const legendUpdated = !allEqProps(["coloredField"], props, nextProps);

    props = nextProps;

    if (dataUpdated) {
      repack(props, state);
    }

    rerender(props, state);

    if (legendUpdated) {
      resetLegend(props, state);
    } else {
      state.legend && state.legend.update({ nodes: state.nodes })
    }

    if (sizeUpdated || dataUpdated) {
      resetZoom(props, state);
    }
  }

  const repack = (props, state) => {
    const hierarchy = makeHierarchy(props.data, props.hierarchyConfig);

    const pack = packWithLabel().size([props.width, props.height]);

    // Pack once without padding to calculate the radius of the leaf node
    // then repack with new padding, similar to how d3-pack
    // works when the size is not given.
    //
    // This way spacing between leaf nodes is consistent between visualizations.
    //
    // Doesn't seem to have a noticable performance impact.
    const packed = pack(hierarchy);
    const padding = packed.leaves()[0].r;
    pack.padding((d) => padding * d.height);

    state.packedData = pack(hierarchy);
  };

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

    state.nodes = nodes;
    state.labels = labels;
    state.countLabels = countLabels;
  };

  const resetLegend = (props, state) => {
    state.legend = setupLegend({
      legend: legend,
      hierarchyConfig: props.hierarchyConfig,
      data: props.data,
      coloredField: props.coloredField
    });

    if(state.legend != null){
      state.legend.update({ nodes: state.nodes })
    }
  };

  const resetZoom = (props, state) => {
    state.zoom = setupZoom({
      zoomRoot: zoomRoot,
      transformRoot: transformRoot,
      nodes: state.nodes,
      labels: state.labels,
      countLabels: state.countLabels,
      width: props.width,
      height: props.height,
      packedData: state.packedData
    });

    let animate = true;

    if (state.selectedNode) {
      const selected = findAncestor(state.selectedNode, state.packedData);
      state.selectedNode = selected;
      animate = false; // smarter animation??
    } else {
      state.selectedNode = state.packedData;
    }

    state.zoom.zoomTo(state.selectedNode, animate);

    nodeRoot.on("click.select", () => {
      const datum = select(d3Event.target).datum();
      state.selectedNode = datum;
      state.zoom.zoomTo(datum);
    });
  };

  return {
    update
  };
}

const allEqProps = (props, o1, o2) => allPass(map(eqProps, props))(o1, o2);

const makeHierarchy = (data, hierarchyConfig) => {
  const hierarchy = toHierarchy(data, hierarchyConfig).count();

  const byUnknown = (a, b) => {
    if (a.data.fieldValue === "Unknown") {
      return b.data.fieldValue === "Unknown" ? 0 : 1;
    } else {
      return b.data.fieldValue === "Unknown" ? -1 : 0;
    }
  };

  const bySize = (a, b) => (b.value || 0) - (a.value || 0);
  const byName = (a, b) =>
    (a.data.fieldValue || "").localeCompare(b.data.fieldValue || "");

  return hierarchy.sort(composeComparators([byUnknown, bySize, byName]));
};

/**
 * Combine a list of comparator function ( (a, b) => Boolean )
 * in order into a single comparator.
 */
const composeComparators = (comparators) => (a, b) =>
  reduceWhile(
    (result) => result === 0, // keep comparing while a === b
    (_, comparator) => comparator(a, b),
    0,
    comparators
  );

/**
 * Find the lowest ancestors of a node (or it self) that exists in a tree.
 */
const findAncestor = (node, hierarchy) => {
  const path = reverse(node.ancestors());
  const findChild = (parent, child) => {
    return find(eqBy(datumKey, child), parent.children || []);
  };

  const res = reduce(
    (last, child) => findChild(last, child) || reduced(last),
    hierarchy,
    tail(path)
  );
  return res;
};

export default d3Viz;
