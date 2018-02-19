import { map, join, path } from "ramda";
import { select, event as d3Event } from "d3-selection";

const setupTooltip = ({ nodeRoot, tooltip, fields }) => {
  nodeRoot.on("mousemove", () => {
    const event = d3Event;
    showTooltip(event, fields, tooltip);
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
      .style("position", "absolute")
      .style("left", `${event.x + 5}px`)
      .style("top", `${event.y + 5}px`);
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
