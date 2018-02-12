import { select, selectAll } from 'd3-selection';

import toHierarchy from './d3-viz/to-hierarchy';

function d3Viz(rootNode) {

  const root = select(rootNode);

  const svg = root.append('svg')
    .attr('width', rootNode.clientWidth)
    .attr('height', rootNode.clientHeight);

  function update({ hierarchyConfig, data }) {
    console.log(toHierarchy(data, hierarchyConfig));
  }

  return {
    update
  }
}

export default d3Viz;
