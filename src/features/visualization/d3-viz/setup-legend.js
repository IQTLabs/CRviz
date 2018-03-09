import { select, event as d3Event } from 'd3-selection';

import {
  curry,
  contains,
  either,
  equals,
  fromPairs,
  toPairs,
  identity,
  reject,
  map,
  path,
  pipe,
  concat,
  times,
  sortBy,
  uniq,
  zip
} from "ramda";

import { schemePaired as colorScheme } from "d3-scale-chromatic";
import { hcl } from "d3-color";

function setupLegend({ legend, nodes, data, hierarchyConfig, coloredField }) {
  if (!coloredField) {
    legend.style("display", "none");
    nodes.select('circle').style('fill', null);
    return;
  } else {
    legend.style("display", null);
  }

  const getValue = either(path(coloredField.path), path(["fieldValue"]));

  const isColoringGroup = contains(coloredField, hierarchyConfig);

  const values = pipe(
    map(getValue),
    uniq,
    reject(equals("Unknown")),
    sortBy(identity)
  )(data);

  const scheme = extendColorScheme(colorScheme, values.length);

  const configs = map((color) => ({ color, disabled: false }), scheme);
  const coloring = zip(values, configs);
  const colorMap = fromPairs(coloring);

  function update() {
    colorNodes({ nodes, colorMap, getValue, coloredField, isColoringGroup });
    updateLegend({ legend, colorMap, toggleValue })
  }

  function toggleValue(value) {
    colorMap[value].disabled = !colorMap[value].disabled;
    update();
  }

  update();
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

const colorNodes = ({ nodes, colorMap, getValue, coloredField, isColoringGroup }) => {
  nodes
    .filter((d) => d.height === 0)
    .select("circle")
    .style( "fill", (d) => {
      const { color, disabled } = colorMap[getValue(d.data)] || {};
      return !isColoringGroup && !disabled && color ? color : null;
    });

  nodes
    .filter((d) => d.height > 0)
    .classed("viz-coloredNode", (d) => {
      const { disabled } = colorMap[getValue(d.data)] || {};
      return !disabled &&
        equals(d.data.field, coloredField) &&
        d.data.fieldValue !== "Unknown";
    })
    .select("circle")
    .style("fill", (d) => {
      const { color, disabled } = colorMap[getValue(d.data)] || {};
      return isColoringGroup
        && equals(d.data.field, coloredField)
        && !disabled
        && color
        ? color
        : null;
    });
}

const extendColorScheme = (colorScheme, count) => {
  const extralayers = Math.floor(count / colorScheme.length);
  if (extralayers === 0) {
    return colorScheme;
  }


  const extraColors = times((i) => {
    const previous = hcl(colorScheme[i % colorScheme.length])
    const cGrowth = mirror((previous.c + 100) / 2)(expDecay(-0.4, 100, previous.c));
    const lDecay = expDecay(-0.5, previous.l, Math.min(previous.l, previous.l / 2));

    const c = cGrowth(i + 1);
    const l = lDecay(i + 1);
    const nextColor = hcl(previous.h, c, l);
    return nextColor.toString();
  }, count - colorScheme.length);

  return concat(colorScheme, extraColors)
}

const expDecay = curry((rate, max, min, t) => {
  return (max - min) * Math.E**(rate * (t)) + min;
});

// Mirror a function f(x) over x = c

const mirror = curry((c, f, x) => f(2 * c - x));

export default setupLegend;
