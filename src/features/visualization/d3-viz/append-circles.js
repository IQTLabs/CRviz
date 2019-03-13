import { selectAll } from "d3";
import { path } from "d3-path";
import datumKey from "./datum-key";

const appendCircles = ({ nodeRoot, labelRoot, packedData, showNodes, hasSearch }) => {
  const isInternal = (d) => d.depth > 0 && d.height > 0;

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
    .on("mouseover", (d) => {
      const node = selectAll(`g.${className("annotation")}[data-key="${datumKey(d)}"]`);
      node.classed(className("annotation-hidden"), false);
    })
    .on("mouseout", (d) => {
      const node = selectAll(`g.${className("annotation")}[data-key="${datumKey(d)}"]`);
      console.log("d %o", d);
      node.classed(className("annotation-hidden"), d.depth > 1);
    })
    .order();

  const circles = nodes.select("circle").merge(nodesEnter.append("circle"));

  circles.attr("r", (d) => d.r);

  const labelShapes = nodes.select("path").merge(nodesEnter.append("path"));

  labelShapes
    .filter((d) => d.labelSize)
    .attr("class", className("labelShape"))
    .attr("d", getLabelShape);

  const labels = labelRoot
    .selectAll(`text.${className("label")}`)
    .data(packedData.descendants().filter(isInternal));

  labels.exit().remove();

  const labelsEnter = labels
    .enter()
    .append("text")
    .classed(className("label"), true);

  const countLabels = labelRoot
    .selectAll(`text.${className("countLabel")}`)
    .data(packedData.descendants().filter((d) => d.height === 1))

  countLabels.exit().remove();

  const countLabelsEnter = countLabels
    .enter()
    .append("text")
    .classed(className("countLabel"), true);

  countLabels
    .merge(countLabelsEnter).text((d) => d.value )
    .style("display", showNodes ? 'none' : 'block');

  return [
    nodes.merge(nodesEnter),
    labels.merge(labelsEnter),
    countLabels.merge(countLabelsEnter)
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

const className = (name) => `viz-${name}`;

export default appendCircles;
