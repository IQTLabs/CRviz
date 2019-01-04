import { select, event as d3Event } from "d3-selection";
import { path } from "d3-path";
import { annotation, annotationCalloutCircle } from "d3-svg-annotation";
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
    .classed(className("containsSearchResult"), (d) => hasSearch && d.data.searchResultCount > 0 && d.depth > 0 && d.height > 0)
    .classed(className("containsNoSearchResult"), (d) => hasSearch && d.data.searchResultCount === 0 && d.depth > 0 && d.height > 0)
    .classed(className("searchResult"), (d) => hasSearch && d.data.isSearchResult && d.depth > 0 && d.height === 0)
    .classed(className("searchExcluded"), (d) => hasSearch && !d.data.isSearchResult && d.depth > 0 && d.height === 0)
    .classed(className("leafNode"), (d) => d.height === 0)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`)
    .attr("display", (d) => !showNodes && d.height === 0 ? 'none' : null)
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
    .style("display", showNodes ? 'none' : 'block')


  // const annotations = [{
  //     'data': { 'id': 'test' },
  //     'x': 1024,
  //     'y': 512,
  //     'dx': 50,
  //     'dy': 50,
  //     'note':{
  //       title: 'test',
  //       'label': 'does this even work?'
  //     },
  //     'subject': { 'radius': 25 },
  //     'color': "black"
  //   }];
  const annotations = mapNodesToAnnotationArray(nodes.data());
  const makeAnnotations = annotation()
                          .annotations(annotations)
                          .type(annotationCalloutCircle)
                          .on('subjectover', function(annotation) {
                            annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                              .classed("hidden", false)
                          })
                          .on('subjectout', function(annotation) {
                            annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                              .classed("hidden", true)
                          })


  // console.log("canvas : %o", canvas);
  // const canvas = 
  const annotationRoot = select(".nodeRoot")
                         .append("g")
                         .attr("class", "annotation-root")
                         .call(makeAnnotations);

  select(".nodeRoot").selectAll("g.annotation-connector, g.annotation-note")
        .classed("hidden", true)

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

const mapNodesToAnnotationArray = (nodes) =>{
  const dataNodes = nodes.filter(n => n.depth >= 1);

  const annotations = dataNodes.map( d => ({
    'data': d.data,
    'x': d.x,
    'y': d.y,
    'dx': 50,
    'dy': 50,
    'note':{
      'label': d.data.uid || ''
    },
    'subject': { 'radius': d.r }
  }));

  return annotations;
}

export default appendCircles;
