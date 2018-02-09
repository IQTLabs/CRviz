import { select, selectAll } from 'd3';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { randomUniform } from 'd3-random';
import { times } from 'ramda';

import toHierarchy from './to-hierarchy';

import data from './fake-data';

function d3Viz(rootNode) {

  const root = select(rootNode);

  const svg = root.append('svg')
    .attr('width', rootNode.clientWidth)
    .attr('height', rootNode.clientHeight);

  function update() {
    const hierarchy = [
      {
        displayName: 'netmask',
        path: ['netmask']
      },
      {
        displayName: 'OS',
        path: ['os', 'os']
      }
    ]

    console.log(toHierarchy(data, hierarchy));
  }

  return {
    update
  }
}

export default d3Viz;
