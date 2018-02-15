import { memoizeWith, slice } from "ramda";

const context = document.createElement("canvas").getContext("2d");

const memoizeKey = (font, text) => [font, text].join(" ");

/**
 * Measure width and height of text using canvas.
 * return an array [width, height]
 */
const measureText = memoizeWith(memoizeKey, (font, text) => {
  context.font = font;

  return [
    Math.floor(context.measureText(text).width),
    // Chrome doesn't support advanced text metrics yet, so
    // we'll use the width of the letter M as an approximation of text height.
    // https://youtu.be/Ps6GBLlSGLs?t=22m51s
    Math.floor(context.measureText("M").width)
  ];
});

// const fitText = (font, text, width) => {
//   let measured = measureText(font, text)[0];

//   if (measured <= width) {
//     return text;
//   }

//   let high = text.length - 1;
//   let low = 0;

//   const ellipsis = String.fromCharCode(8230);

//   while (high > low) {
//     const mid = low + Math.floor((high - low) / 2);
//     const newText = slice(0, mid + 1, text) + ellipsis;
//     measured = measureText(font, newText)[0];

//     if (measured < width) {
//       low = mid;
//     } else {
//       high = mid - 1;
//     }
//   }

//   return slice(0, high, text) + ellipsis;
// };

const fitText = (font, text, width) => {
  var original = text;
  // var fontSpec = getFontSpec(textElement);
  // var fontSpec = '12px sans-serif';
  var textLength = measureText(font, text)[0];

  while (textLength >= width && text.length > 0) {
    text = text.slice(0, text.length - 1);
    textLength = measureText(font, text + "…")[0];
  }

  return text + (text.length < original.length ? String.fromCharCode(8230) : "");
}



/**
 * Get CSS font from DOM node
 * Return the entire string, e.g. "12px sans-serif"
 */
const getFont = (domElement) => {
  const style = getComputedStyle(domElement);
  const family = style.getPropertyValue('font-family')
  const size = style.getPropertyValue('font-size')

  return  size + " " + family;
}

export { measureText, fitText, getFont };
