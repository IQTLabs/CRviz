import datumKey from "./datum-key";

const setupAnnotations = ({packedData, annotationRoot, colorMap}) =>{
  const data = packedData.descendants().filter(d => d.depth > 0 && d.height > 0);
  const firstLeaf = packedData.descendants().filter(d => d.height === 0)[0];
  const leafRadius = firstLeaf.r || 0;

  const annotations = annotationRoot
    .selectAll(`g.${className("annotation")}`)
    .data(data, datumKey);

  annotations.exit().remove();

  const annotationsEnter = annotations.enter().append("g").classed(className("annotation"), true);

  annotationsEnter
    .merge(annotations)
    .attr('data-key', datumKey)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`)
    .order();

  const baseAngle = -60
  const titleAngle = baseAngle * (Math.PI/180)
  annotations
  .select(`text.${className("annotation-title")}`)
  .merge(annotationsEnter
    .append("text")
    .classed(className("annotation-title"), true)
    .attr('x', (d) => (d.r * Math.cos(titleAngle)) + (9*leafRadius))
    .attr('y', (d) => (d.r * Math.sin(titleAngle)))
    .text((d) => d.data.fieldValue)
  );

  const addedAngle = (baseAngle + leafRadius) * (Math.PI/180)
  const added = annotationRoot
  .selectAll(`g.${className("added-container")}`)
  .data(data, datumKey);

  added.exit().remove();
  const addedEnter = 
    added.enter().append("g").classed(className("added-container"), true)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`);
  added
  .select(`g.${className("added-container")}`)
  .merge(addedEnter
    .append('g')
      .classed(className("isAdded"), true)
    .append('circle')
      .attr('r', leafRadius)
      .attr('cx', (d) => (d.r * Math.cos(addedAngle)) + (3*leafRadius))
      .attr('cy', (d) => (d.r * Math.sin(addedAngle)))
  );

  added
  .select(`g.${className("added-container")}`)
  .merge(addedEnter
    .append("text")
      .classed(className("annotation-text"), true)
      .attr('x', (d) => (d.r * Math.cos(addedAngle)) + (7*leafRadius))
      .attr('y', (d) => (d.r * Math.sin(addedAngle)))
      .text((d) => ": " + Math.max(0, d.data.CRVIZ["_addCount"]))
  );

  const changedAngle = (baseAngle + 2*leafRadius) * (Math.PI/180)
  const changed = annotationRoot
  .selectAll(`g.${className("changed-container")}`)
  .data(data, datumKey);

  changed.exit().remove();
  const changedEnter = 
    changed.enter().append("g").classed(className("changed-container"), true)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`);
  changed
  .select(`g.${className("changed-container")}`)
  .merge(addedEnter
    .append('g')
      .classed(className("isChanged"), true)
    .append('circle')
      .attr('r', leafRadius)
      .attr('cx', (d) => (d.r * Math.cos(changedAngle)) + (3*leafRadius))
      .attr('cy', (d) => (d.r * Math.sin(changedAngle)))
  );

  changed
  .select(`g.${className("changed-container")}`)
  .merge(changedEnter
    .append("text")
      .classed(className("annotation-text"), true)
      .attr('x', (d) => (d.r * Math.cos(changedAngle)) + (7*leafRadius))
      .attr('y', (d) => (d.r * Math.sin(changedAngle)))
      .text((d) => ": " + Math.max(0, d.data.CRVIZ["_changedCount"]))
  );

  const removedAngle = (baseAngle + 3*leafRadius) * (Math.PI/180)
  const removed = annotationRoot
  .selectAll(`g.${className("removed-container")}`)
  .data(data, datumKey);

  removed.exit().remove();
  const removedEnter = 
    removed.enter().append("g").classed(className("removed-container"), true)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`);
  removed
  .select(`g.${className("removed-container")}`)
  .merge(removedEnter
    .append('g')
      .classed(className("isRemoved"), true)
    .append('circle')
      .attr('r', leafRadius)
      .attr('cx', (d) => (d.r * Math.cos(removedAngle)) + (3*leafRadius))
      .attr('cy', (d) => (d.r * Math.sin(removedAngle)))
  );

  removed
  .select(`g.${className("removed-container")}`)
  .merge(removedEnter
    .append("text")
      .classed(className("annotation-text"), true)
      .attr('x', (d) => (d.r * Math.cos(removedAngle)) + (7*leafRadius))
      .attr('y', (d) => (d.r * Math.sin(removedAngle)))
      .text((d) => ": " + Math.max(0, d.data.CRVIZ["_removedCount"]))
  );
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