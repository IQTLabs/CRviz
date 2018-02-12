import { path } from "d3-path";

const appendCircles = ({ root, packedData, onHover, onClick }) => {
  const gs = root.selectAll("g").data(packedData.descendants(), datumKey);

  gs.exit().remove();

  const gsEnter = gs.enter().append("g");

  gsEnter.merge(gs).attr("transform", function(d) {
    return `translate(${[d.x, d.y].join(",")})`;
  });

  const circles = gs.select("circle").merge(gsEnter.append("circle"));

  const isInternal = (d) => d.depth > 0 && d.height > 0;

  circles
    .attr("r", (d) => d.r)
    .attr("fill", "rgba(0,0,0,0.2)")
    .attr("stroke-width", (d) => d.r * 0.01);

  circles.on('click', onClick);
  circles.on('hover', onHover);

  circles.filter((d) => d.depth === 0).attr("class", "rootCircle");
  circles.filter(isInternal).attr("class", "groupCircle");
  circles.filter((d) => d.height === 0).attr("class", "leafCircle");

  const labelShapes = gs.select("path").merge(gsEnter.append("path"));

  labelShapes
    .filter((d) => d.labelSize)
    .attr("class", "labelShape")
    .attr("d", (d) => {
      var top = d.r - d.labelSize;
      var radius = d.r;

      var startAngle = Math.PI / 2 + Math.acos(top / radius);
      var endAngle = Math.PI / 2 - Math.acos(top / radius);

      var shape = path();
      shape.arc(0, 0, radius, startAngle, endAngle, true);
      shape.closePath();
      return shape.toString();
    });

  const labels = gs
    .filter(isInternal)
    .select("text")
    .merge(gsEnter.append("text"));

  labels.attr("class", "label");
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
