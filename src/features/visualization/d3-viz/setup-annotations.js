import { annotation, annotationCalloutCircle } from "d3-svg-annotation";

const setupAnnotations = ({nodeRoot, annotationRoot, colorMap}) =>{
	const groupNodes = nodeRoot.selectAll(`g.${className("groupingNode")}`).data();

    const annotations = mapNodesToAnnotationArray(groupNodes, colorMap);
    const makeAnnotations = annotation()
                            .annotations(annotations)
                            .type(annotationCalloutCircle)
                            // .on('subjectover', function(annotation) {
                            //   annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                            //     .classed("hidden", false)
                            // })
                            // .on('subjectout', function(annotation) {
                            //   annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                            //     .classed("hidden", true)
                            // })

    return annotationRoot.call(makeAnnotations);
}

const mapNodesToAnnotationArray = (nodes, colorMap) =>{
  const annotations = nodes.map( d => ({
    'data': d.data,
    'x': d.x,
    'y': d.y,
    'dx': d.r,
    'dy': -1 * (d.labelY + (d.labelSize/2)),
    'note':{
      'label': d.data.fieldValue || '',
      'title': d.data.fieldValue || ''
    },
    'subject': { 'radius': d.r -1 },
    'color': colorMap[d.data.fieldValue] && !colorMap[d.data.fieldValue].disabled ? 
                colorMap[d.data.fieldValue].color : "black"
  }));
  console.log("annotation array: %o", annotations);
  return annotations;
}

const className = (name) => `viz-${name}`;

export default setupAnnotations;