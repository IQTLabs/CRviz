import { selectAll, select, event as d3Event } from 'd3-selection';

import {
  contains,
  either,
  equals,
  fromPairs,
  toPairs,
  identity,
  map,
  path,
  pipe,
  sortBy,
  uniq,
  zip
} from "ramda";

import { colorScheme, extendColorScheme } from './color-scheme';

function setupLegend({ legend, data, hierarchyConfig, coloredField, legendConfig }) {
  if (!coloredField) {
    legend.style("display", "none");

    const state = { nodes: [] }

    function update({ nodes }) {
      state.nodes = nodes;
      if (!coloredField) {
        nodes.select('circle').attr('class', null);
        nodes.classed('viz-coloredNode', false);
        return;
      }
    }

    return { update };
  } else {
    legend.style("display", null);
  }

  const getValue = either(path(coloredField.path), path(["fieldValue"]));

  // If coloring groupings, don't color devices with the same value
  const isColoringGroup = contains(coloredField, hierarchyConfig);

  const values = pipe(
    map(getValue),
    uniq,
    sortBy(identity)
  )(data);

  const scheme = extendColorScheme(colorScheme, values.length);

  const configs = scheme.map((color, index) => ({
    color,
    disabled: false,
    className: `legend-color-${index}`
  }));

  const coloring = zip(values, configs);
  const colorMap = fromPairs(coloring);

  createStylesheet(coloring);

  const state = { nodes: [] }

  function update({ nodes }) {
    state.nodes = nodes;
    if (!coloredField) {
      nodes.select('circle').attr('class', null);
      nodes.classed('viz-coloredNode', false);
      return;
    }

    colorNodes({ nodes, colorMap, getValue, coloredField, isColoringGroup });
    updateLegend({ legend, colorMap, toggleValue })
  }

  function toggleValue(value) {
    colorMap[value].disabled = !colorMap[value].disabled;
    update({ nodes: state.nodes });
  }

  return { update };
}

const updateLegend = ({ legend, colorMap, toggleValue }) => {
  const items = legend
    .selectAll("p.viz-legendItem")
    .data(toPairs(colorMap), ([value]) => value );

  items.exit().remove();

  const itemsEnter = items.enter().append("p").classed("viz-legendItem", true)
  itemsEnter.append("span").classed("viz-legendColor", true);
  itemsEnter.append("span").classed("viz-legendLabel", true);

  items.merge(itemsEnter)
    .classed("viz-legendDisabled", (d) => d[1].disabled);

  items.merge(itemsEnter)
    .select(".viz-legendColor")
    .style("background-color", ([value, { color }]) => color);

  items.merge(itemsEnter)
    .select(".viz-legendLabel")
    .attr('title', ([value]) => value)
    .text(([value]) => value);

  legend.on('click.toggle', () => {
    const datum = select(d3Event.target).datum();
    if (datum) {
      toggleValue(datum[0]);
    }
  })
}

/**
 * Having inline style trigger an expensive "recalculate style" in every frame
 * during zooming (even if the style attribute is empty!).
 *
 * We work around this by creating a style element that contains a class for
 * each item in the legend and assign those classes to each circle.
*/
const createStylesheet = (coloring) => {
  const style = selectAll('style#coloring').data([coloring]);
  const styleEnter = style.enter().append('style').attr('id', 'coloring');

  const html = coloring.map(([ value, { color, className } ], index) => {
    return `
      .viz-node circle.${className} {
        fill: ${color} !important
      }
    `
  }).join("\n");

  style.merge(styleEnter)
    .html(html)
}

const colorNodes = ({ nodes, colorMap, getValue, coloredField, isColoringGroup }) => {

  nodes
    .filter((d) => d.height === 0)
    .select("circle")
    .attr('class', (d) => {
      const { disabled, className } = colorMap[getValue(d.data)] || {};
      return !isColoringGroup && !disabled && className ? className : null
    });

  nodes
    .filter((d) => d.height > 0)
    .classed("viz-coloredNode", (d) => {
      const { disabled } = colorMap[getValue(d.data)] || {};
      return !disabled &&
        equals(d.data.field, coloredField) 
    })
    .select("circle")
    .attr('class', (d) => {
      const { disabled, className } = colorMap[getValue(d.data)] || {};
      return isColoringGroup
        && equals(d.data.field, coloredField)
        && !disabled
        && className;
    });
}

export default setupLegend;
