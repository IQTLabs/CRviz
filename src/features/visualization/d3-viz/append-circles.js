import { path } from "d3-path";

import datumKey from "./datum-key";

const appendCircles = ({ root, packedData }) => {
  const className = (name) => `viz-${name}`;

  const nodes = root
    .selectAll(`g.${className("node")}`)
    .data(packedData.descendants(), datumKey);

  nodes.exit().remove();

  const nodesEnter = nodes.enter().append("g");

  nodesEnter
    .merge(nodes)
    .classed(className("node"), true)
    .classed(className("rootNode"), (d) => d.depth === 0)
    .classed(className("groupingNode"), (d) => d.depth > 0 && d.height > 0)
    .classed(className("leafNode"), (d) => d.height === 0)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`)
    .order();

  const isInternal = (d) => d.depth > 0 && d.height > 0;

  const circles = nodes.select("circle").merge(nodesEnter.append("circle"));

  circles.attr("r", (d) => d.r).attr("vector-effect", "non-scaling-stroke");

  const labelShapes = nodes.select("path").merge(nodesEnter.append("path"));

  labelShapes
    .filter((d) => d.labelSize)
    .attr("class", className("labelShape"))
    .attr("fill", "rgba(0, 0, 0, 0.2)")
    .attr("d", (d) => {
      const top = d.r - d.labelSize;
      const radius = d.r;

      const startAngle = Math.PI / 2 + Math.acos(top / radius);
      const endAngle = Math.PI / 2 - Math.acos(top / radius);

      const shape = path();
      shape.arc(0, 0, radius, startAngle, endAngle, true);
      shape.closePath();
      return shape.toString();
    });

  nodesEnter
    .filter(isInternal)
    .append("text")
    .attr("text-anchor", "middle")
    .style("pointer-events", "none");

  return nodes.merge(nodesEnter);
};

export default appendCircles;
