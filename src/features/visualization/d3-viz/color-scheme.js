import { times, concat } from "ramda";
import { scaleLinear, scalePow } from 'd3-scale';
import { hcl } from "d3-color";

const colorScheme = [
  "#a6cee3",
  "#3366cc",
  "#b2df8a",
  "#33a02c",
  "#fb9a99",
  "#996699",
  "#fdbf6f",
  "#ff7f00",
  "#cc99ff",
  "#6a3d9a",
  "#ffff99",
  "#b15928",
  "#ffcc99",
  "#333399"
];

const extendColorScheme = (colorScheme, count) => {
  const extraLayers = Math.floor(count / colorScheme.length);

  if (extraLayers === 0) {
    return colorScheme;
  }

  const extraColors = times((i) => {
    const currentLayer = (i + colorScheme.length) / colorScheme.length;

    const previous = hcl(colorScheme[i % colorScheme.length])
    const neighbor = hcl(colorScheme[(i + 1) % colorScheme.length])

    const hScale = scaleLinear()
      .domain([0, extraLayers])
      .range([previous.h, neighbor.h]);

    const cScale = scalePow()
      .exponent(5)
      .domain([0, extraLayers])
      .range([previous.c, 100]);

    const lScale = scalePow()
      .exponent(2)
      .domain([0, extraLayers])
      .range([previous.l, previous.l / 2]);

    const h = hScale(currentLayer)
    const c = cScale(currentLayer);
    const l = lScale(currentLayer);

    const nextColor = hcl(h, c, l);
    return nextColor.toString();
  }, count - colorScheme.length);

  return concat(colorScheme, extraColors)
}

export { colorScheme, extendColorScheme };
