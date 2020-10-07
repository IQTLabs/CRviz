import { zoom, zoomTransform } from "d3-zoom";
import { zoomIdentity } from "d3-zoom";

const setupZoom = ({
  zoomRoot,
  transformRoot,
  nodes,
  showNodes,
  width,
  height,
  packedData
}) => {

  const state = {
    zoomTo: null,
    zoomToTransform: null,
    // Find the current zoom transform if any
    transform: zoomTransform(zoomRoot.node())
  };

  const zoomBehavior = zoom();

  zoomBehavior.on("zoom", (event, d) => {
    state.transform = event.transform;
    zoomToTransform(event.transform)
  });

  zoomRoot.call(zoomBehavior);

  // Amount of space to leave around a node when zoomed into that node
  // (as a fraction of the node diameter)
  const viewPadding = 0.25;

  const { r: rootR, x: rootX, y: rootY } = packedData;

  const scaleExtent = [
    Math.min(width, height) / (rootR * 2),
    Math.min(width, height) / (packedData.leaves()[0].r * 2 * (1 + viewPadding))
  ];

  const translateExtent = [
    [
      rootX - width / 2 / scaleExtent[0] * 2,
      rootY - height / 2 / scaleExtent[0] * 2
    ],
    [
      rootX + width / 2 / scaleExtent[0] * 2,
      rootY + height / 2 / scaleExtent[0] * 2
    ]
  ];

  zoomBehavior.scaleExtent(scaleExtent).translateExtent(translateExtent);

  // Assume everything is hidden by default.
  //
  // Note:
  // This could have been done using inline style.
  // The odd thing is, when using inline style, apparently each node's style is
  // recalculated in every frame during zooming regardless of whether or not
  // the inline style was changed.
  //
  // Using a class avoided this issue.
  nodes.classed('viz-zoomMinutia', true);

  function zoomToTransform(transform) {
    transformRoot
      .style("transform", `translate(${ Math.floor(transform.x) }px, ${ Math.floor(transform.y) }px) scale(${ transform.k })`);

    const bound = viewBound(width, height, transform);

    const nodesInView = nodes.filter((d) => boundOverlap(bound, nodeBound(d)));

    nodesInView
      .call(hideSmall, transform)
  };

  function zoomTo(datum, animate = true) {
    const size = datum.r * 2 * (1 + viewPadding);
    const k = Math.min(width, height) / size;
    const transform = zoomIdentity
      .scale(k)
      .translate(
          - datum.x + width / 2 / k,
          - datum.y + height / 2 / k,
      );

    zoomBehavior.transform(
      !animate ? zoomRoot : zoomRoot.transition().duration(1000),
      transform
    );
  }

  if (state.transform) {
    zoomToTransform(state.transform);
  }

  state.zoomTo = zoomTo;
  state.zoomToTransform = zoomToTransform;

  return state;
};

const hideSmall = (nodes, transform) => {
  const tooSmall = (d) => d.r * transform.k < 1;

  nodes
    .filter(":not(.viz-zoomMinutia)")
    .filter((d) => tooSmall(d))
    .classed("viz-zoomMinutia", true);

  nodes
    .filter(".viz-zoomMinutia")
    .filter((d) => !tooSmall(d))
    .classed("viz-zoomMinutia", false)
};

/**
 * The bound of the view given the original width, height, and transform
 */
const viewBound = (width, height, transform) => {
  var size = Math.min(width, height);
  var boundWidth = size * Math.max(width / height, 1);
  var boundHeight = size * Math.max(height / width, 1);

  var bound = [
    -transform.x / transform.k,
    -transform.y / transform.k,
    (-transform.x + boundWidth) / transform.k,
    (-transform.y + boundHeight) / transform.k
  ];
  return bound;
};

const nodeBound = (datum) => [
  datum.x - datum.r,
  datum.y - datum.r,
  datum.x + datum.r,
  datum.y + datum.r
];

const boundOverlap = (bound0, bound1) => {
  return (
    bound0[0] <= bound1[2] &&
    bound0[2] >= bound1[0] &&
    bound0[1] <= bound1[3] &&
    bound0[3] >= bound1[1]
  );
};

export default setupZoom;
