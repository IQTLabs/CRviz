const setupTooltip = ({ nodeRoot, tooltip, fields }) => {
  tooltip
    .style("display", "block")
    .style("position", "absolute")
    .style("transform", null)
    .style("top", "0px")
    .style("left", "0px");
  // Measurements need to be taken before hiding the tooltip, otherwise they are
  // not accurate.
  tooltip.style("display", "none")
};



export default setupTooltip;
