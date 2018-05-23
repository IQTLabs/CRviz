import { map, join, path } from "ramda";
import { select, event as d3Event } from "d3-selection";

const setupTooltip = ({ nodeRoot, tooltip, fields }) => {
  tooltip
    .style("display", "block")
    .style("position", "absolute")
    .style("transform", null)
    .style("top", "0px")
    .style("left", "0px");

  const boundingRect = tooltip.node().getBoundingClientRect();

  const offsetLeft = -boundingRect.left + 5;
  const offsetTop = -boundingRect.top + 5;

  // Measurements need to be taken before hiding the tooltip, otherwise they are
  // not accurate.
  tooltip.style("display", "none")

  nodeRoot.on("mousemove", () => {
    const event = d3Event;
    showTooltip(event, fields, offsetTop, offsetLeft, tooltip);

  });
};

const showTooltip = (event, fields, offsetTop, offsetLeft, tooltip) => {
  const target = select(event.target);
  const datum = target.datum();
  const text = content(datum, fields);
  if (text) {
    tooltip.node().innerHTML = text;
    tooltip
      .style("display", "block")
      .style("transform", `translate3d(${ event.x + offsetLeft + 1 }px, ${ event.y + offsetTop + 1 }px, 0)`)
  } else {
    tooltip.style("display", "none");
  }
  //tooltip.classed("searchResult", datum.data.isSearchResult);
};

const content = (datum, fields) => {
  if (datum.depth > 0 && datum.height > 0) {
    let cont = `${ datum.data.fieldValue } (${datum.value})`;
    if(datum.data.searchResultCount > 0){
      cont += `<br/><span>${datum.data.searchResultCount} search results</span>`
    }
    return cont;
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
