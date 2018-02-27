import { zoom } from "d3-zoom";
import { event as d3Event } from "d3-selection";
import { zoomIdentity } from "d3-zoom";
import { measureText, fitText, getFont } from "./text-utils";

const setupZoom = ({
  zoomRoot,
  transformRoot,
  nodes,
  labels,
  countLabels,
  showNodes,
  width,
  height,
  packedData
}) => {
  const zoomBehavior = zoom();
  zoomBehavior.on("zoom", () => {
    const event = d3Event;
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

  const [labelFont, labelHeight] = getLabelStyle(labels);
  const [countLabelFont, countLabelHeight] = getLabelStyle(countLabels);

  const zoomToTransform = (transform) => {
    transformRoot
      .style("transform", `translate(${ Math.floor(transform.x) }px, ${ Math.floor(transform.y) }px) scale(${ transform.k })`);

    const bound = viewBound(width, height, transform);

    const nodesInView = nodes.filter((d) => boundOverlap(bound, nodeBound(d)));
    const labelsInView = labels.filter((d) => boundOverlap(bound, nodeBound(d)));
    const labelsNotInView = labels.filter((d) => !boundOverlap(bound, nodeBound(d)));
    const countLabelsInView = countLabels.filter((d) => boundOverlap(bound, nodeBound(d)));
    const hiddenCountLabels = countLabels.filter((d) => !boundOverlap(bound, nodeBound(d)));

    nodesInView
      .call(hideSmall, transform)

    labelsInView
      .style('visibility', 'visible')
      .call(fitLabels, transform, labelFont, labelHeight, bound);

    labelsNotInView.style('visibility', 'hidden');

    countLabelsInView
      .style('visibility', 'visible')
      .call(fitCounts, transform, countLabelFont, countLabelHeight, bound);

    hiddenCountLabels.style("visibility", "hidden");
  };

  const zoomTo = (datum, animate = true) => {
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

  return {
    zoomTo,
    zoomToTransform
  }
};

const hideSmall = (nodes, transform) => {
  nodes.attr("visibility", (d) => (d.r * transform.k < 1 ? "hidden" : "visible"));
};

const fitCounts = (countLabels, transform, font, countHeight, viewBound) => {
  const fitVertically = (d) => (d.r * 2 - d.labelSize) * transform.k * 0.66 >= countHeight;

  countLabels
    .style("visibility", (d) => fitVertically(d) ? "visible" : "hidden")
    .filter(fitVertically)
    .text((datum) => {
      const labelText = datum.value;
      const maxWidth = Math.floor(datum.r * 2 * 0.75 * transform.k);
      return fitText(font, labelText, maxWidth);
    })
    .attr("transform", (d) => {
      return zoomIdentity
        .translate(transform.applyX(d.x), transform.applyY(d.y - (d.labelSize / 2)))
    });
};

const fitLabels = (labels, transform, labelFont, labelHeight, viewBound) => {
  const fitVertically = (d) => d.labelSize * transform.k >= labelHeight;

  labels
    .style("visibility", (d) => (fitVertically(d) ? "visible" : "hidden"))
    .filter(fitVertically)
    .text((datum) => {
      const labelText = `${datum.data.fieldValue} (${datum.value})`;
      // We'll try to fit more text on the label at the expense
      // of possibly having labels extend outside of their area.
      const maxWidth = Math.floor(datum.labelSize * transform.k * 1.1);
      return fitText(labelFont, labelText, maxWidth);
    })
    .attr("transform", function scaleLabel(d) {
      return zoomIdentity
        .translate(transform.applyX(d.x), transform.applyY(d.y + d.labelY))
    })
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

const getLabelStyle = (labels) => {
  let font = null,
    height = null;
  if (labels.size() > 0) {
    font = getFont(labels.nodes()[0]);
    height = measureText(font, "M")[1];
  }

  return [font, height];
};

export default setupZoom;
