import { path } from "d3-path";

import datumKey from "./datum-key";
import className from "./class-name";

const appendCircles = ({ nodeRoot, labelRoot, packedData, showNodes, hasSearch }) => {
  const data = packedData.descendants();

  const nodes = nodeRoot
    .selectAll(`g.${className("node")}`)
    .data(data, datumKey);

  nodes.exit().remove();  

  const nodesEnter = nodes.enter().append("g").classed(className("node"), true);
  nodesEnter
    .merge(nodes)
    .attr('data-key', datumKey)
    .classed(className("rootNode"), (d) => d.depth === 0)
    .classed(className("groupingNode"), (d) => d.depth > 0 && d.height > 0)
    .classed(className("containsSearchResult"), (d) => hasSearch && d.data.CRVIZ._searchResultCount > 0 && d.depth > 0 && d.height > 0)
    .classed(className("containsNoSearchResult"), (d) => hasSearch && d.data.CRVIZ._searchResultCount === 0 && d.depth > 0 && d.height > 0)
    .classed(className("searchResult"), (d) => hasSearch && d.data.CRVIZ._isSearchResult && d.depth > 0 && d.height === 0)
    .classed(className("isChanged"), (d) => d.data.CRVIZ._isChanged && d.depth > 0 && d.height === 0)
    .classed(className("isAdded"), (d) => d.data.CRVIZ._isAdded && d.depth > 0 && d.height === 0)
    .classed(className("isRemoved"), (d) => d.data.CRVIZ._isRemoved && d.depth > 0 && d.height === 0)
    .classed(className("searchExcluded"), (d) => hasSearch && !d.data.CRVIZ._isSearchResult && d.depth > 0 && d.height === 0)
    .classed(className("leafNode"), (d) => d.height === 0)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`)
    .attr("display", (d) => !showNodes && d.height === 0 ? 'none' : null)
    .order();

  const circles = nodes.select("circle").merge(nodesEnter.append("circle"));

  circles.attr("r", (d) => d.r);

  const newLabelGroups = nodesEnter.append("g").classed(className('label-group'), true);
  const newLabelShapes = newLabelGroups.append("path");
  const newLabels = newLabelGroups.append('text').classed(className('label'), true);

  const labelShapes = nodes.select(`g.${className('label-group')}`).select('path');
  labelShapes
  .merge(newLabelShapes)
    .filter((d) => d.labelSize)
    .attr("class", className("labelShape"))
    .attr("d", getLabelShape);

  const labels = nodes.select(`g.${className('label-group')}`).select('text');
  labels
  .merge(newLabels)
    .filter((d) => d.labelSize)
    .style('font-size', (d) => ((2*d.leafRadius)/16) *200 + "%")
    .attr('y', (d) => d.r - (d.labelSize/2))
    .text((d) => d.data.fieldValue);

  return [
    nodes.merge(nodesEnter),
  ];
};

/**
 * Calculate the d attribute of a path element representing the shape of the
 * label area (the partial circles at the bottom of the grouping nodes)
 */
const getLabelShape = (d) => {
  const top = d.r - d.labelSize;
  const radius = d.r;

  const startAngle = Math.PI / 2 + Math.acos(top / radius);
  const endAngle = Math.PI / 2 - Math.acos(top / radius);

  const shape = path();
  shape.arc(0, 0, radius, startAngle, endAngle, true);
  shape.closePath();

  return shape.toString();
}

export default appendCircles;
