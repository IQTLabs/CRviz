import { path } from "d3-path";

const appendCircles = ({ root, packedData }) => {
  const className = (name) => `viz-${name}`;

  const nodes = root
    .selectAll(`g.${className('circle')}`)
    .data(packedData.descendants(), datumKey);

  nodes.exit().remove();

  const nodesEnter = nodes.enter()
    .append("g")
    .classed([className('circle')], true)

  nodesEnter.merge(nodes).attr("transform", function(d) {
    return `translate(${[d.x, d.y].join(",")})`;
  }).order();

  const circles = nodes.select("circle").merge(nodesEnter.append("circle"));

  const isInternal = (d) => d.depth > 0 && d.height > 0;

  circles
    .attr("r", (d) => d.r)
    .attr("fill", "rgba(0,0,0,0.2)")
    .attr("stroke-width", (d) => 1)
    .attr("vector-effect", 'non-scaling-stroke');

  circles.filter((d) => d.depth === 0).classed([className("rootCircle")], true);
  circles.filter(isInternal).classed([className("groupCircle")], true);
  circles.filter((d) => d.height === 0).classed([className("leafCircle")], true);

  const labelShapes = nodes.select("path").merge(nodesEnter.append("path"));

  labelShapes
    .filter((d) => d.labelSize)
    .attr("class", className("labelShape"))
    .attr("fill", "rgba(0, 0, 0, 0.2)")
    .attr("d", (d) => {
      const   top = d.r - d.labelSize;
      const radius = d.r;

      const startAngle = Math.PI / 2 + Math.acos(top / radius);
      const endAngle = Math.PI / 2 - Math.acos(top / radius);

      const shape = path();
      shape.arc(0, 0, radius, startAngle, endAngle, true);
      shape.closePath();
      return shape.toString();
    });

  const labelEnter = nodesEnter
    .filter(isInternal)
    .append("text")
    .attr('text-anchor', 'middle')
    .style('pointer-events', 'none')

  return nodes.merge(nodesEnter);
};

const datumKey = (datum) => {
  if (datum.depth === 0) {
    return datum.data.fieldValue;
  }
  if (datum.height > 0) {
    return [datum.data.field.path.join("."), datum.data.fieldValue].join(".");
  } else {
    return datum.data.uid;
  }
};

export default appendCircles;
