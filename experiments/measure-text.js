(function(){
  var context = document.createElement('canvas').getContext('2d');

  window.measureText = function(element) {
    var style = getComputedStyle(element);
    var family = style.getPropertyValue('font-family')
    var size = style.getPropertyValue('font-size')
    context.font = size + " " + family;
    return [
      context.measureText(element.textContent).width,
      context.measureText('M').width
    ];
  }
}());
