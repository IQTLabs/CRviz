import datumKey from "./datum-key";

const setupAnnotations = ({packedData, annotationRoot, colorMap}) =>{
  const data = packedData.descendants().filter(d => d.depth > 0 && d.height > 0);
  const firstLeaf = packedData.descendants().filter(d => d.height === 0)[0];
  const leafRadius = firstLeaf.r || 0;
  const annotations = annotationRoot
    .selectAll(`g.${className("annotation")}`)
    .data(data, datumKey);

  annotations.exit().remove();

  const annotationsEnter = annotations.enter().append("g")
  .attr('id', (d) => "annotation-" + datumKey(d))
  .classed(className("annotation"), true)
  .classed(className("annotation-hidden"), (d) =>  d.depth > 1);

  const baseAngle = -60 * (Math.PI/180);
  const titleAngle = baseAngle;
  annotationsEnter
    .merge(annotations)
    .attr('data-key', datumKey)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`)
    .order();

  //title
  annotations
  .select(`text.${className("annotation-title")}`)
  .merge(annotationsEnter
    .append("text")
    .classed(className("annotation-title"), true)
    .attr('x', (d) => (d.r * Math.cos(titleAngle)) + (9*leafRadius))
    .attr('y', (d) => (d.r * Math.sin(titleAngle)))
    .text((d) => d.data.fieldValue)
  );
  //added nodes
  annotations
  .select(`g.${className("added-container")}`)
  .merge(annotationsEnter
    .append('g')
      .classed(className("isAdded"), true)
    .append('circle')
      .attr('r', leafRadius)
      .attr('cx', (d) => (d.r * Math.cos(baseAngle + 2*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (3*leafRadius))
      .attr('cy', (d) => (d.r * Math.sin(baseAngle + 2*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
  );

  annotations
  .select(`g.${className("added-container")}`)
  .merge(annotationsEnter
    .append("text")
      .classed(className("annotation-text"), true)
      .attr('x', (d) => (d.r * Math.cos(baseAngle + 2*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (6*leafRadius))
      .attr('y', (d) => (d.r * Math.sin(baseAngle + 2*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
      .text((d) => !isNaN(d.data.CRVIZ["_addedCount"]) ? ": " + d.data.CRVIZ["_addedCount"] : ": 0")
  );
  //changed nodes
  annotations
  .select(`g.${className("changed-container")}`)
  .merge(annotationsEnter
    .append('g')
      .classed(className("isChanged"), true)
    .append('circle')
      .attr('r', leafRadius)
      .attr('cx', (d) => (d.r * Math.cos(baseAngle + 4*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (3*leafRadius))
      .attr('cy', (d) => (d.r * Math.sin(baseAngle + 4*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
  );

  annotations
  .select(`g.${className("changed-container")}`)
  .merge(annotationsEnter
    .append("text")
      .classed(className("annotation-text"), true)
      .attr('x', (d) => (d.r * Math.cos(baseAngle + 4*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (6*leafRadius))
      .attr('y', (d) => (d.r * Math.sin(baseAngle + 4*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
      .text((d) => !isNaN(d.data.CRVIZ["_changedCount"]) ? ": " + d.data.CRVIZ["_changedCount"] : ": 0")
  );
  //removed nodes
  annotations
  .select(`g.${className("removed-container")}`)
  .merge(annotationsEnter
    .append('g')
      .classed(className("isRemoved"), true)
    .append('circle')
      .attr('r', leafRadius)
      .attr('cx', (d) => (d.r * Math.cos(baseAngle + 6*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (3*leafRadius))
      .attr('cy', (d) => (d.r * Math.sin(baseAngle + 6*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
  );

  annotations
  .select(`g.${className("removed-container")}`)
  .merge(annotationsEnter
    .append("text")
      .classed(className("annotation-text"), true)
      .attr('x', (d) => (d.r * Math.cos(baseAngle + 6*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (6*leafRadius))
      .attr('y', (d) => (d.r * Math.sin(baseAngle + 6*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
      .text((d) => !isNaN(d.data.CRVIZ["_removedCount"]) ? ": " + d.data.CRVIZ["_removedCount"] : ": 0")
  );

}

const getAngleOfLeafNodeDiameter = (radius, leafRadius) => {
  const c = 2*radius*Math.PI;
  const ratio = (2*leafRadius)/c;
  return ratio*2*Math.PI;
}

// const mapNodesToAnnotationArray = (nodes, colorMap) =>{
//   const annotations = nodes.map( d => ({
//     'data': { 'fieldData': d.data, 'height': d.height, 'depth': d.depth }, 
//     className: className("annotation"),
//     'x': d.x,
//     'y': d.y,
//     'dx': d.r,
//     'dy': -1 * (d.labelY + (d.labelSize/2)),
//     'note':{
//       'label': d.data.fieldValue || '',
//       'title': d.data.fieldValue || ''
//     },
//     'subject': { 'radius': d.r -1 },
//     'color': colorMap[d.data.fieldValue] && !colorMap[d.data.fieldValue].disabled ? 
//                 colorMap[d.data.fieldValue].color : "black"
//   }));
//   return annotations;
// }

const className = (name) => `viz-${name}`;

export default setupAnnotations;