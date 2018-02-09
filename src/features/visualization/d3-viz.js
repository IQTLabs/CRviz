import { select, selectAll, schemeCategory10 } from 'd3';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { hcl } from 'd3-color';
import packWithLabel from './pack-with-label';

function d3Viz(rootNode) {

  const root = select(rootNode);

  const svg = root.append('svg')
    .attr('width', rootNode.clientWidth)
    .attr('height', rootNode.clientHeight);


  const tooltip = root.append('div');

  function update() {
    const hierarchy = d3Hierarchy({
      "name": "Eve",
      "children": [
        {
          "name": "Cain"
        },
        {
          "name": "Seth",
          "children": [
            {
              "name": "Enos"
            },
            {
              "name": "Noam"
            }
          ]
        },
        {
          "name": "Abel"
        },
        {
          "name": "Awan",
          "children": [
            {
              "name": "Enoch"
            }
          ]
        },
        {
          "name": "Azura"
        }
      ]
    }).count();

    // const hierarchy = d3Hierarchy({
    //   name: 'a',
    //   children: [
    //     { name: 'b', children: [{ value: 1000 }, { value: 1000 }, { value: 500 }] },
    //     { name: 'c', value: 1000 },
    //     { name: 'e', value: 1000},
    //     { name: 'f', value: 8000 },
    //   ]
    // }).count();

    var pack = packWithLabel()
      .size([500, 500])

    pack(hierarchy);


    const circles = svg.selectAll('circle').data(hierarchy.descendants());

    circles.enter()
      .append('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => d.r)
      .attr('fill', (d) => {
        return 'black'
      })
      .attr('fill-opacity', (d) => {
        return 0.2
      })

  }

  return {
    update
  }
}

export default d3Viz;
