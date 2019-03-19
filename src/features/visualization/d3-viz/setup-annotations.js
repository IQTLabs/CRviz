import datumKey from "./datum-key";
import className from "./class-name";

const setupAnnotations = ({packedData, annotationRoot, colorMap}) =>{
  const data = packedData.descendants().filter(d => d.depth > 0 && d.height > 0);
  const firstLeaf = packedData.descendants().filter(d => d.height === 0)[0];
  const leafRadius = firstLeaf.r || 0;
  const annotations = annotationRoot
    .selectAll(`g.${className("annotation")}`)
    .data(data, datumKey);

  annotations.exit().remove();

  const annotationsEnter = annotations.enter().append("g")
  .classed(className("annotation"), true)
  .classed(className("annotation-hidden"), (d) =>  d.depth > 1);

  const baseAngle = -70 * (Math.PI/180);
  const titleAngle = baseAngle;
  annotationsEnter
    .merge(annotations)
    .attr('data-key', datumKey)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`)
    .order();

  //title
  const newTitles = annotationsEnter.append("text")
    .classed(className("annotation-title"), true);
  const mergedTitles = annotations.select(`text.${className("annotation-title")}`)
    .merge(newTitles);

  mergedTitles
  .attr('x', (d) => ((d.r + 2*leafRadius) * Math.cos(titleAngle)) + (9*leafRadius))
  .attr('y', (d) => ((d.r + 2*leafRadius) * Math.sin(titleAngle)))
  .text((d) => d.data.fieldValue);

  //totals
  const totalAngleOffset = 2.5;    
  const newTotalContainer = annotationsEnter
    .append('g')
      .classed(className("total-container"), true);;
  const newCircles = newTotalContainer
    .append('g')
      .classed(className("leafNode"), true)
    .append('circle')
      .attr('r', leafRadius)

  annotations
  .select(`g.${className("total-container")}`)
  .select(`g.${className("leafNode")}`)
  .select('circle')
  .merge(newCircles)
    .attr('cx', (d) => ((d.r + 2*leafRadius) * Math.cos(baseAngle + totalAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
    .attr('cy', (d) => ((d.r + 2*leafRadius) * Math.sin(baseAngle + totalAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))));

  const newTotalText = newTotalContainer
  .append("text")
    .classed(className("annotation-text"), true);

  annotations
  .select(`g.${className("total-container")}`)
  .select('text')
  .merge(newTotalText)
    .attr('x', (d) => ((d.r + 2*leafRadius) * Math.cos(baseAngle + totalAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (2*leafRadius))
    .attr('y', (d) => ((d.r + 2*leafRadius) * Math.sin(baseAngle + totalAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
    .text((d) => !isNaN(d.value) ? ": " + d.value : ": 0");

  //added nodes
  const addedAngleOffset = 4.5;
  const newAddedContainer = annotationsEnter
    .append('g')
      .classed(className("added-container"), true);;
  const newPluses = newAddedContainer
    .append('g')
      .classed(className("isAdded-fixed"), true)
    .append('circle')
      .attr('r', leafRadius)

  annotations
  .select(`g.${className("added-container")}`)
  .select(`g.${className("isAdded-fixed")}`)
  .select('circle')
  .merge(newPluses)
    .attr('cx', (d) => ((d.r + 2*leafRadius) * Math.cos(baseAngle + addedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
    .attr('cy', (d) => ((d.r + 2*leafRadius) * Math.sin(baseAngle + addedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))));

  const newAddedText = newAddedContainer
  .append("text")
    .classed(className("annotation-text"), true);

  annotations
  .select(`g.${className("added-container")}`)
  .select('text')
  .merge(newAddedText)
    .attr('x', (d) => ((d.r + 2*leafRadius) * Math.cos(baseAngle + addedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (2*leafRadius))
    .attr('y', (d) => ((d.r + 2*leafRadius) * Math.sin(baseAngle + addedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
    .text((d) => !isNaN(d.data.CRVIZ["_addedCount"]) ? ": " + d.data.CRVIZ["_addedCount"] : ": 0");

  //changed nodes
  const changedAngleOffset = 6.5;
  const newChangedContainer = annotationsEnter
    .append('g')
      .classed(className("changed-container"), true);;
  const newDeltas = newChangedContainer
    .append('g')
      .classed(className("isChanged-fixed"), true)
    .append('circle')
      .attr('r', leafRadius)

  annotations
  .select(`g.${className("changed-container")}`)
  .select(`g.${className("isChanged-fixed")}`)
  .select('circle')
  .merge(newDeltas)
    .attr('cx', (d) => ((d.r + 2*leafRadius) * Math.cos(baseAngle + changedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
    .attr('cy', (d) => ((d.r + 2*leafRadius) * Math.sin(baseAngle + changedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))));

  const newChangedText = newChangedContainer
  .append("text")
    .classed(className("annotation-text"), true);

  annotations
  .select(`g.${className("changed-container")}`)
  .select('text')
  .merge(newChangedText)
    .attr('x', (d) => ((d.r + 2*leafRadius) * Math.cos(baseAngle + changedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (2*leafRadius))
    .attr('y', (d) => ((d.r + 2*leafRadius) * Math.sin(baseAngle + changedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
    .text((d) => !isNaN(d.data.CRVIZ["_changedCount"]) ? ": " + d.data.CRVIZ["_changedCount"] : ": 0");

  //removed nodes
  const removedAngleOffset = 8.5;
  const newRemovedContainer = annotationsEnter
    .append('g')
      .classed(className("removed-container"), true);;
  const newMinuses = newRemovedContainer
    .append('g')
      .classed(className("isRemoved-fixed"), true)
    .append('circle')
      .attr('r', leafRadius)

  annotations
  .select(`g.${className("removed-container")}`)
  .select(`g.${className("isRemoved-fixed")}`)
  .select('circle')
  .merge(newMinuses)
    .attr('cx', (d) => ((d.r + 2*leafRadius) * Math.cos(baseAngle + removedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
    .attr('cy', (d) => ((d.r + 2*leafRadius) * Math.sin(baseAngle + removedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))));

  const newRemovedText = newRemovedContainer
  .append("text")
    .classed(className("annotation-text"), true);

  annotations
  .select(`g.${className("removed-container")}`)
  .select('text')
  .merge(newRemovedText)
    .attr('x', (d) => ((d.r + 2*leafRadius) * Math.cos(baseAngle + removedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))) + (2*leafRadius))
    .attr('y', (d) => ((d.r + 2*leafRadius) * Math.sin(baseAngle + removedAngleOffset*getAngleOfLeafNodeDiameter(d.r, leafRadius))))
    .text((d) => !isNaN(d.data.CRVIZ["_removedCount"]) ? ": " + d.data.CRVIZ["_removedCount"] : ": 0");

  return annotations.merge(annotationsEnter);
}

const getAngleOfLeafNodeDiameter = (radius, leafRadius) => {
  const c = 2*radius*Math.PI;
  const ratio = (2*leafRadius)/c;
  return ratio*2*Math.PI;
}

export default setupAnnotations;