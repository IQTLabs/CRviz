import { select } from "d3";
import { path } from "d3-path";

import datumKey from "./datum-key";
import className from "./class-name";

const appendCircles = ({ nodeRoot, labelRoot, packedData, showNodes, hasSearch }) => {
  const data = packedData.descendants();
  const firstLeaf = packedData.leaves()[0];
  const leafRadius = firstLeaf.r || 0;
  const fontScale = ((2*leafRadius)/16) *100;

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
  const mergedLabels = labels
  .merge(newLabels)
    .filter((d) => d.labelSize)
    .style('font-size', (d, i, nodes) => (2 * d.height * fontScale) + "%")
    .attr('y', (d) => d.r - (d.labelSize/2))
    .text((d) => d.data.fieldValue);

  mergedLabels.each( (d, i, nodes) => {
    scaleAndTrimToLabelWidth(nodes[i], d);
  })

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

const getLabelWidth = (datum) =>{
  const top = datum.r - datum.labelSize;
  const radius = datum.r;

  const startAngle = Math.PI / 2 + Math.acos(top / radius);
  const endAngle = Math.PI / 2 - Math.acos(top / radius);
  const arcAngle = startAngle - endAngle;

  //length of a chord across a circle with angle theta
  //is calculated as:
  // 2*radius * sin(theta/2)
  return 2*radius*Math.sin(arcAngle/2);
}

const scaleAndTrimToLabelWidth = (node, datum) => {
  const labelWidth = getLabelWidth(datum);
  const labelHeight = datum.labelSize;
  const minFontScale = 25;

  let boxWidth = node.getBBox().width;
  let boxHeight = node.getBBox().height;
  let fontScale = 150;

  //scale to height
   while ((boxHeight > 0.66 * labelHeight || boxWidth > 0.80 * labelWidth) && fontScale > minFontScale){

    select(node)
      // eslint-disable-next-line
      .style('font-size', (d, i, nodes) => fontScale + "%")
      .text(datum.data.fieldValue);

    fontScale -= 5;
    boxWidth = node.getBBox().width;
    boxHeight = node.getBBox().height;
  }
 

  //trim to width
  let labelText = datum.data.fieldValue;
  while (boxWidth > 0.80 * labelWidth){

    select(node)
      .style('font-size', (d, i, nodes) => fontScale + "%")
      .text(labelText);

    labelText = labelText.substr(0, labelText.length - 5) + "...";
    boxWidth = node.getBBox().width;
    boxHeight = node.getBBox().height;
  }
}

export default appendCircles;
