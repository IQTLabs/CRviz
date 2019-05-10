import { select, selectAll } from "d3";

import { memoizeWith } from "ramda";

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

  //const baseAngle(d) = -60 * (Math.PI/180);
  
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
    .style('font-size', (d) => (3 * d.height * fontScale) + "%")
    .text('\uf06a');

  annotations
  .select(`g.${className("change-icon-container")}`)
  .select('text.svg-icon')
  .merge(newChangeIcon)
    .attr('x', (d) => (getEdgePositionX(d.r, baseAngle(d))))
    .attr('y', (d) => (getEdgePositionY(d.r, baseAngle(d))))
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
      .classed(className('bg-circle'), true)
      .attr('r', (d) =>  18*d.height*leafRadius)

  annotations
  .select(`g.${className("ring-menu")}`)
  .select('circle')
  .merge(newBgCircles)
    .attr('cx', (d) => (getEdgePositionX(d.r, baseAngle(d))))
    .attr('cy', (d) => (getEdgePositionY(d.r, baseAngle(d))));

  const newX = newRingMenu
  .append('text')
    .classed('svg-icon', true)
    .style('font-size', (d) => 3 * d.height * fontScale + "%")
    .text('\uf00d');

  annotations
  .select(`g.${className("ring-menu")}`)
  .select('text.svg-icon')
  .merge(newX)
    .attr('x', (d) => getEdgePositionX(d.r, baseAngle(d)))
    .attr('y', (d) => (getEdgePositionY(d.r, baseAngle(d))))
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
  newTotalContainer
    .append('g')
      .classed(className("node"), true)
    .append('circle')
      .attr('r', (d) => 2 * d.height * leafRadius)
      .attr('cx', (d) => (getEdgePositionX(d.r, baseAngle(d))) - 3.5*d.height*leafRadius)
      .attr('cy', (d) => (getEdgePositionY(d.r, baseAngle(d))) - 10*d.height*leafRadius);

  annotations
  .select(`g.${className("total-container")}`)
  .merge(newTotalContainer)
  .on("click", (d, i, nodes) => {
      const dk = datumKey(d);
      const glyph = select(nodes[i])
        .select(`g.${className("node")}`)
      const showHide = glyph.classed(className("ringMenuExcluded"));

      const leaves = selectAll(`g.${className("node")}`)
        .filter((e) =>{
          const ancestors = e.ancestors();
          return ancestors.findIndex( a => datumKey(a) === dk) !== -1;
        })
        .filter((d, i, nodes) => {
          const item = select(nodes[i])
          return !item.classed(className("isAdded")) 
            && !item.classed(className("isChanged")) 
            && !item.classed(className("isRemoved"))
            && !item.classed(className("groupingNode"));
        });

      if(!leaves.empty()){
        glyph.classed(className("ringMenuExcluded"), !showHide);
        leaves.classed(className("ringMenuExcluded"), !showHide);
      }
    }
  )

  const newTotalText = newTotalContainer
  .append("text")
    .classed(className("annotation-text"), true)
    .style('font-size', (d) => (2 * d.height * fontScale) + "%")
    .attr('x', (d) => (getEdgePositionX(d.r, baseAngle(d))) + 3.5*d.height*leafRadius)
    .attr('y', (d) => (getEdgePositionY(d.r, baseAngle(d))) - 10*d.height*leafRadius);

  annotations
  .select(`g.${className("total-container")}`)
  .select('text')
  .merge(newTotalText)
    .text((d) => !isNaN(d.value) ? d.value : "0");

  //added nodes
  const newAddedContainer = newRingMenu
    .append('g')
      .classed(className("added-container"), true);
  newAddedContainer
    .append('g')
      .classed(className("isAdded-fixed"), true)
    .append('circle')
      .attr('r', (d) => 2 * d.height * leafRadius)
      .attr('cx', (d) => (getEdgePositionX(d.r, baseAngle(d))) - 13.5*d.height*leafRadius)
      .attr('cy', (d) => (getEdgePositionY(d.r, baseAngle(d))));

  annotations
  .select(`g.${className("added-container")}`)
  .merge(newAddedContainer)
  .on("click", (d, i, nodes) => {
      const dk = datumKey(d);
      const glyph = select(nodes[i])
        .select(`g.${className("isAdded-fixed")}`)
      const showHide = glyph.classed(className("ringMenuExcluded"));

      const childGlyphs = selectAll(`g.${className("isAdded-fixed")}`)
        .filter((e) =>{
          if(e){
            const ancestors = e.ancestors();
            return ancestors.findIndex( a => datumKey(a) === dk) !== -1;
          }
          else 
            return false;
        });

      const added = selectAll(`g.${className("isAdded")}`)
        .filter((e) =>{
          if(e){
            const ancestors = e.ancestors();
            return ancestors.findIndex( a => datumKey(a) === dk) !== -1;
          }
          else 
            return false;
        });

      if(!added.empty()){
        glyph.classed(className("ringMenuExcluded"), !showHide);
        childGlyphs.classed(className("ringMenuExcluded"), !showHide);
        added.classed(className("ringMenuExcluded"), !showHide);
      }
    }
  )   

  const newAddedText = newAddedContainer
  .append("text")
    .classed(className("annotation-text"), true)
    .style('font-size', (d) => (2 * d.height * fontScale) + "%")
    .attr('x', (d) => (getEdgePositionX(d.r, baseAngle(d))) - 7.5*d.height*leafRadius)
    .attr('y', (d) => (getEdgePositionY(d.r, baseAngle(d))));

  annotations
  .select(`g.${className("added-container")}`)
  .select('text')
  .merge(newAddedText)
    .text((d) => !isNaN(d.data.CRVIZ["_addedCount"]) ? d.data.CRVIZ["_addedCount"] : "0");

  //changed nodes
  const newChangedContainer = newRingMenu
    .append('g')
      .classed(className("changed-container"), true);
  newChangedContainer
    .append('g')
      .classed(className("isChanged-fixed"), true)
    .append('circle')
      .attr('r', (d) => 2 * d.height * leafRadius)
      .attr('cx', (d) => (getEdgePositionX(d.r, baseAngle(d))) - 3.5 * d.height * leafRadius)
      .attr('cy', (d) => (getEdgePositionY(d.r, baseAngle(d))) + 10 * d.height * leafRadius);

  annotations
  .select(`g.${className("changed-container")}`)
  .merge(newChangedContainer)
  .on("click", (d, i, nodes) => {
      const dk = datumKey(d);
      const glyph = select(nodes[i])
        .select(`g.${className("isChanged-fixed")}`)
      const showHide = glyph.classed(className("ringMenuExcluded"));

      const childGlyphs = selectAll(`g.${className("isChanged-fixed")}`)
        .filter((e) =>{
          if(e){
            const ancestors = e.ancestors();
            return ancestors.findIndex( a => datumKey(a) === dk) !== -1;
          }
          else 
            return false;
        });

      const changed = selectAll(`g.${className("isChanged")}`)
        .filter((e) =>{
          if(e){
            const ancestors = e.ancestors();
            return ancestors.findIndex( a => datumKey(a) === dk) !== -1;
          }
          else 
            return false;
        });

      if(!changed.empty()){
        glyph.classed(className("ringMenuExcluded"), !showHide);
        childGlyphs.classed(className("ringMenuExcluded"), !showHide);
        changed.classed(className("ringMenuExcluded"), !showHide);
      }
    }
  ) 

  const newChangedText = newChangedContainer
  .append("text")
    .classed(className("annotation-text"), true)
    .style('font-size', (d) => (2 * d.height * fontScale) + "%")
    .attr('x', (d) => (getEdgePositionX(d.r, baseAngle(d))) + d.height * leafRadius)
    .attr('y', (d) => (getEdgePositionY(d.r, baseAngle(d))) + 10 * d.height * leafRadius);

  annotations
  .select(`g.${className("changed-container")}`)
  .select('text')
  .merge(newChangedText)
    .text((d) => !isNaN(d.data.CRVIZ["_changedCount"]) ?  + d.data.CRVIZ["_changedCount"] : "0");

  //removed nodes
  const newRemovedContainer = newRingMenu
    .append('g')
      .classed(className("removed-container"), true);
  newRemovedContainer
    .append('g')
      .classed(className("isRemoved-fixed"), true)
    .append('circle')
      .attr('r', (d) => 2 * d.height * leafRadius)
      .attr('cx', (d) => (getEdgePositionX(d.r, baseAngle(d))) + 6.5*d.height * leafRadius)
      .attr('cy', (d) => (getEdgePositionY(d.r, baseAngle(d))));

  annotations
  .select(`g.${className("removed-container")}`)
  .merge(newRemovedContainer)
  .on("click", (d, i, nodes) => {
      const dk = datumKey(d);
      const glyph = select(nodes[i])
        .select(`g.${className("isRemoved-fixed")}`)
      const showHide = glyph.classed(className("ringMenuExcluded"));

      const childGlyphs = selectAll(`g.${className("isRemoved-fixed")}`)
        .filter((e) =>{
          if(e){
            const ancestors = e.ancestors();
            return ancestors.findIndex( a => datumKey(a) === dk) !== -1;
          }
          else 
            return false;
        });

      const removed = selectAll(`g.${className("isRemoved")}`)
        .filter((e) =>{
          if(e){
            const ancestors = e.ancestors();
            return ancestors.findIndex( a => datumKey(a) === dk) !== -1;
          }
          else 
            return false;
        });

      if(!removed.empty()){
        glyph.classed(className("ringMenuExcluded"), !showHide);
        childGlyphs.classed(className("ringMenuExcluded"), !showHide);
        removed.classed(className("ringMenuExcluded"), !showHide);
      }
    }
  )    

  const newRemovedText = newRemovedContainer
  .append("text")
    .classed(className("annotation-text"), true)
    .style('font-size', (d) => (2 * d.height * fontScale) + "%")
    .attr('x', (d) => (getEdgePositionX(d.r, baseAngle(d))) + 13*d.height * leafRadius)
    .attr('y', (d) => (getEdgePositionY(d.r, baseAngle(d))));

  annotations
  .select(`g.${className("removed-container")}`)
  .select('text')
  .merge(newRemovedText)
    .text((d) => !isNaN(d.data.CRVIZ["_removedCount"]) ? d.data.CRVIZ["_removedCount"] : "0");

  return annotations.merge(annotationsEnter);
}

//memoize is being used here to cache function returns for a specific set of parameters. 
//i.e. we will evaluate once for a radius of 10 and angle of 60
//afterwards we will use the cached value for those parameters. 
const memoizeKey = (r, angle) => [r, angle].join(" ");

const baseAngle = (d) => {
    return Math.PI / 2 - Math.acos((d.r -d.labelSize) / d.r);
}

const getEdgePositionX = memoizeWith(memoizeKey, (r, angle) => {
  return r * Math.cos(angle);
});

const getEdgePositionY = memoizeWith(memoizeKey, (r, angle) => {
  return r * Math.sin(angle);
});

export default setupAnnotations;