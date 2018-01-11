(function(){
  var context = document.createElement('canvas').getContext('2d');

  var measure = R.memoizeWith(
    function(fontSpec, text) {
      return fontSpec + " " + text;
    },
    function(fontSpec, text) {
      context.font = fontSpec;
      return [
        context.measureText(text).width,
        context.measureText('M').width
      ];
  });

  var getFontSpec = function(element) {
    var style = getComputedStyle(element);
    var family = style.getPropertyValue('font-family')
    var size = style.getPropertyValue('font-size')

    return  size + " " + family;
  }

  window.measureText = function measureText(element) {
    // var fontSpec = getFontSpec(textElement);
    var fontSpec = '12px sans-serif';
    return measure(fontSpec, element.textContent);
  }

  // return the substring of textElement that fits inside the specify width
  window.fitText = function fitText(textElement, text, width) {
    var original = text;
    // var fontSpec = getFontSpec(textElement);
    var fontSpec = '12px sans-serif';
    var textLength = measure(fontSpec, text)[0];

    while (textLength >= width && text.length > 0) {
      text = text.slice(0, text.length - 1);
      textLength = measure(fontSpec, text + "…")[0];
    }

    return text + (text.length < original.length ? String.fromCharCode(8230) : "");
  }
}());

