import { map, join, path } from "ramda";
import { select, event as d3Event } from "d3-selection";

const setupTooltip = ({ nodeRoot, tooltip, fields }) => {
  nodeRoot.on("mousemove", () => {
    const event = d3Event;
    showTooltip(event, fields, tooltip);

    tooltip
      .style("position", "absolute")
      .style("top", "0px")
      .style("left", "0px");
  });
};

const showTooltip = (event, fields, tooltip) => {
  const target = select(event.target);
  const datum = target.datum();

  const text = content(datum, fields);
  if (text) {
    tooltip.node().innerHTML = text;
    tooltip
      .style("display", "block")
      .style("transform", `translate3d(${ event.x + 1 }px, ${ event.y + 1 }px, 0)`)
  } else {
    tooltip.style("display", "none");
  }
};

const content = (datum, fields) => {
  if (datum.depth > 0 && datum.height > 0) {
    return `${ datum.data.fieldValue } (${datum.value})`;
  } else if (datum.height === 0) {
    const pairs = map(
      (field) => [`<strong>${ field.displayName }</strong>`, path(field.path, datum.data)],
      fields
    );
    return map(join(": "), pairs).join("<br />");
  } else {
    return null;
  }
};

export default setupTooltip;
