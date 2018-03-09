import {
  curry,
  contains,
  either,
  equals,
  fromPairs,
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

import { schemeCategory10 as colorScheme } from "d3-scale-chromatic";
import { hcl } from "d3-color";


// Picked from Google Material Design Color Scheme
// const colorScheme = [
//   "#EF5350",
//   "#78909C",
//   "#AB47BC",
//   "#8D6E63",
//   "#5C6BC0",
//   "#FF7043",
//   "#42A5F5",
//   "#FFA726",
//   "#26C6DA",
//   "#FFEE58",
//   "#26A69A",
//   "#9CCC65"
// ];

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
  const coloring = zip(values, scheme);
  const colorMap = fromPairs(coloring);

  colorNodes({ nodes, colorMap, getValue, coloredField, isColoringGroup });

  updateLegend({ legend, coloring });
}

/**
 * @param legend - the D3 element used to display the legend
 * @param coloring - array of tuples of [field value, color]
 */
const updateLegend = ({ legend, coloring }) => {
  const items = legend
    .selectAll("p.viz-legendItem")
    .data(coloring, ([value, color]) => value  + color);

  items.exit().remove();

  const itemsEnter = items.enter().append("p").classed("viz-legendItem", true)
  itemsEnter.append("span").classed("viz-legendColor", true);
  itemsEnter.append("span").classed("viz-legendLabel", true);

  items.merge(itemsEnter)
    .select(".viz-legendColor")
    .style("background-color", ([value, color]) => color);

  items.merge(itemsEnter)
    .select(".viz-legendLabel")
    .attr('title', ([value, color]) => value)
    .text(([value, color]) => value);
}

const colorNodes = ({ nodes, colorMap, getValue, coloredField, isColoringGroup }) => {
  nodes
    .filter((d) => d.height === 0)
    .select("circle")
    .style( "fill", (d) => isColoringGroup ? null: colorMap[getValue(d.data)]);

  nodes
    .filter((d) => d.height > 0)
    .classed("viz-coloredNode", (d) => equals(d.data.field, coloredField))
    .select("circle")
    .style("fill", (d) => {
      return isColoringGroup && equals(d.data.field, coloredField)
        ? colorMap[getValue(d.data)]
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
