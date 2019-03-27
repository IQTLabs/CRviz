import { selectAll } from "d3";

import datumKey from "./datum-key";
import className from "./class-name";

const setupAnnotations = ({packedData, annotationRoot}) =>{
  //sum up change counts because we only are interested in groups that have changes to display
  const data = packedData.descendants().filter(d => d.depth > 0 && d.height > 0 
    && d.data.CRVIZ && (d.data.CRVIZ["_addedCount"] + d.data.CRVIZ["_changedCount"] + d.data.CRVIZ["_removedCount"]) > 0);

  const firstLeaf = packedData.leaves()[0];
  const leafRadius = firstLeaf.r || 0;
  const fontScale = ((2*leafRadius)/16) *100;
  
  const annotations = annotationRoot
    .selectAll(`g.${className("annotation")}`)
    .data(data, datumKey);

  annotations.exit().remove();

  const annotationsEnter = annotations.enter().append("g")
  .classed(className("annotation"), true);

  const baseAngle = -60 * (Math.PI/180);
  annotationsEnter
    .merge(annotations)
    .attr('data-key', datumKey)
    .attr("transform", (d) => `translate(${[d.x, d.y].join(",")})`)
    .order();

  //changed nodes indicator
  const newChangeIconContainer = annotationsEnter
    .append('g')
      .classed(className("change-icon-container"), true);
  const newChangeIcon = newChangeIconContainer
  .append('text')
    .classed('svg-icon', true)
    .classed('nag', true)
    .style('font-size', (d) => (d.height * fontScale) + "%")
    .text('\uf06a');

  annotations
  .select(`g.${className("change-icon-container")}`)
  .select('text.svg-icon')
  .merge(newChangeIcon)
    .attr('x', (d) => (d.r * Math.cos(baseAngle)))
    .attr('y', (d) => (d.r * Math.sin(baseAngle)))
    .on("click", (d) => {
      const annotation = selectAll(`g.${className("annotation")}[data-key="${datumKey(d)}"]`);

      annotation
      .select(`g.${className("change-icon-container")}`)
        .classed(className("annotation-hidden"), true);

      annotation
      .select(`g.${className("change-icon-container")}`)
      .select('text.nag')
        .classed('nag', false);

      annotation
      .select(`g.${className("ring-menu")}`)
        .classed(className("annotation-hidden"), false);

    })


  //ring menu
  const newRingMenu = annotationsEnter
    .append('g')
      .classed(className("ring-menu"), true)
      .classed(className("annotation-hidden"), true);

  const newBgCircles = newRingMenu
    .append('circle')
      .classed('bg-circle', true)
      .style('fill', 'white')
      .attr('r', (d) =>  10*leafRadius)

  annotations
  .select(`g.${className("ring-menu")}`)
  .select('circle')
  .merge(newBgCircles)
    .attr('cx', (d) => (d.r * Math.cos(baseAngle)))
    .attr('cy', (d) => (d.r * Math.sin(baseAngle)));

  const newX = newRingMenu
  .append('text')
    .classed('svg-icon', true)
    .style('font-size', (d) => ((2*leafRadius)/16) *100 + "%")
    .text('\uf00d');

  annotations
  .select(`g.${className("ring-menu")}`)
  .select('text.svg-icon')
  .merge(newX)
    .attr('x', (d) => d.r * Math.cos(baseAngle))
    .attr('y', (d) => (d.r * Math.sin(baseAngle)))
    .on("click", (d) => {
      const annotation = selectAll(`g.${className("annotation")}[data-key="${datumKey(d)}"]`);

      annotation
      .select(`g.${className("change-icon-container")}`)
        .classed(className("annotation-hidden"), false);

      annotation
      .select(`g.${className("ring-menu")}`)
        .classed(className("annotation-hidden"), true);
    });

  //Icons inside ring menu  
  //totals 
  const newTotalContainer = newRingMenu
    .append('g')
      .classed(className("total-container"), true);
  const newCircles = newTotalContainer
    .append('g')
      .classed(className("leafNode"), true)
    .append('circle')
      .attr('r', (d) => leafRadius);

  annotations
  .select(`g.${className("total-container")}`)
  .select(`g.${className("leafNode")}`)
  .select('circle')
  .merge(newCircles)
    .attr('cx', (d) => (d.r * Math.cos(baseAngle)) - 3*leafRadius)
    .attr('cy', (d) => (d.r * Math.sin(baseAngle)) - 4*leafRadius);

  const newTotalText = newTotalContainer
  .append("text")
    .classed(className("annotation-text"), true)
    .style('font-size', (d) => ((2*leafRadius)/16) *100 +"%");

  annotations
  .select(`g.${className("total-container")}`)
  .select('text')
  .merge(newTotalText)
    .attr('x', (d) => (d.r * Math.cos(baseAngle)) + 2.5*leafRadius)
    .attr('y', (d) => (d.r * Math.sin(baseAngle)) - 4*leafRadius)
    .text((d) => !isNaN(d.value) ? ": " + d.value : ": 0");

  //added nodes
  const newAddedContainer = newRingMenu
    .append('g')
      .classed(className("added-container"), true);
  const newPluses = newAddedContainer
    .append('g')
      .classed(className("isAdded-fixed"), true)
    .append('circle')
      .attr('r', (d) => leafRadius);

  annotations
  .select(`g.${className("added-container")}`)
  .select(`g.${className("isAdded-fixed")}`)
  .select('circle')
  .merge(newPluses)
    .attr('cx', (d) => (d.r * Math.cos(baseAngle)) - 7.5*leafRadius)
    .attr('cy', (d) => (d.r * Math.sin(baseAngle)));

  const newAddedText = newAddedContainer
  .append("text")
    .classed(className("annotation-text"), true)
    .style('font-size', (d) => ((2*leafRadius)/16) *100 +"%");

  annotations
  .select(`g.${className("added-container")}`)
  .select('text')
  .merge(newAddedText)
    .attr('x', (d) => (d.r * Math.cos(baseAngle)) - 5.5*leafRadius)
    .attr('y', (d) => (d.r * Math.sin(baseAngle)))
    .text((d) => !isNaN(d.data.CRVIZ["_addedCount"]) ? ": " + d.data.CRVIZ["_addedCount"] : ": 0");

  //changed nodes
  const newChangedContainer = newRingMenu
    .append('g')
      .classed(className("changed-container"), true);
  const newDeltas = newChangedContainer
    .append('g')
      .classed(className("isChanged-fixed"), true)
    .append('circle')
      .attr('r', (d) => leafRadius);

  annotations
  .select(`g.${className("changed-container")}`)
  .select(`g.${className("isChanged-fixed")}`)
  .select('circle')
  .merge(newDeltas)
    .attr('cx', (d) => (d.r * Math.cos(baseAngle)) - 2.5*leafRadius)
    .attr('cy', (d) => (d.r * Math.sin(baseAngle)) + 4*leafRadius);

  const newChangedText = newChangedContainer
  .append("text")
    .classed(className("annotation-text"), true)
    .style('font-size', (d) => ((2*leafRadius)/16) *100 + "%");

  annotations
  .select(`g.${className("changed-container")}`)
  .select('text')
  .merge(newChangedText)
    .attr('x', (d) => (d.r * Math.cos(baseAngle)) + 1*leafRadius)
    .attr('y', (d) => (d.r * Math.sin(baseAngle)) + 4*leafRadius)
    .text((d) => !isNaN(d.data.CRVIZ["_changedCount"]) ? ": " + d.data.CRVIZ["_changedCount"] : ": 0");

  //removed nodes
  const newRemovedContainer = newRingMenu
    .append('g')
      .classed(className("removed-container"), true);
  const newMinuses = newRemovedContainer
    .append('g')
      .classed(className("isRemoved-fixed"), true)
    .append('circle')
      .attr('r', (d) => leafRadius);

  annotations
  .select(`g.${className("removed-container")}`)
  .merge(newRemovedContainer)
  .on("click", (d) => {
      const groupNode = selectAll(`g.${className("groupingNode")}[data-key="${datumKey(d)}"]`);
      const removed = groupNode
      .selectAll(`g.${className("isRemoved")}`);

      const showHide = removed.filter((d, i) => i === 0).classed(className("annotation-hidden"));

      const changed = groupNode
      .selectAll(`g.${className("isChanged")}`);

      const added = groupNode
      .selectAll(`g.${className("isAdded")}`);
      
      const leaves = groupNode
      .selectAll(`g.${className("leafNode")}`);

      leaves.classed(className("annotation-hidden"), showHide);
      added.classed(className("annotation-hidden"), showHide);
      changed.classed(className("annotation-hidden"), showHide);
      removed.classed(className("annotation-hidden"), !showHide);
    }
  )

  annotations
  .select(`g.${className("removed-container")}`)
  .select(`g.${className("isRemoved-fixed")}`)
  .select('circle')
  .merge(newMinuses)
    .attr('cx', (d) => (d.r * Math.cos(baseAngle)) + 4.5*leafRadius)
    .attr('cy', (d) => (d.r * Math.sin(baseAngle)));

  const newRemovedText = newRemovedContainer
  .append("text")
    .classed(className("annotation-text"), true)
    .style('font-size', (d) => ((2*leafRadius)/16) *100 +"%");

  annotations
  .select(`g.${className("removed-container")}`)
  .select('text')
  .merge(newRemovedText)
    .attr('x', (d) => (d.r * Math.cos(baseAngle)) + 6.5*leafRadius)
    .attr('y', (d) => (d.r * Math.sin(baseAngle)))
    .text((d) => !isNaN(d.data.CRVIZ["_removedCount"]) ? ": " + d.data.CRVIZ["_removedCount"] : ": 0");

  return annotations.merge(annotationsEnter);
}

// const getAngleOfLeafNodeDiameter = (radius, offsetIncrement) => {
//   const c = 2*radius*Math.PI;
//   const ratio = (2*offsetIncrement)/c;
//   return ratio*2*Math.PI;
// }

export default setupAnnotations;