(function(groupOrderControl) {
  'use strict';
  function paths(object) {
    return R.chain(function(key) {
      if (typeof object[key] === 'object') {
        return R.map(R.concat([key]), paths(object[key])
        )
      } else {
        return [[key]];
      }
    }, R.keys(object));
  };

  // Assume all object has the same "schema"
  var allGroups = paths(DATA[0]);
  window.groupOrder = [];

  var rootControl = d3.select(groupOrderControl);
  var groupList = rootControl.select('.groupOrder').append('ol');

  var groupSelect = rootControl
    .append('select')
    .attr('class', 'groupType');

  var emptyOption = groupSelect.append('option')
    .attr('value', '')
    .text('-')

  var addButton = rootControl
    .append('button')
    .attr('class', 'addButton')
    .text('Add')
    .on('click', function() {
      var value = groupSelect.node().value;
      if (value !== '') {
        groupOrder.push(unkey(value))
        update();
      }
    })

  function key(path) {
    return path.join('|');
  }

  function unkey(key) {
    return key.split('|');
  }

  window.updateHierarchyControl = function updateHierarchyControl() {
    console.log('groupOrder', groupOrder);
    var toKeys = R.map(key);
    var toPaths = R.map(unkey);

    var available = toPaths(R.difference(toKeys(allGroups), toKeys(groupOrder)));

    var options = groupSelect
      .selectAll("option:not([value=''])")
      .data(available.sort(), key);

    options.enter()
      .append('option')
      .attr('value', key)
      .text(R.join('_'))

    options.exit().remove();

    var listItems = groupList
      .selectAll('li')
      .data(groupOrder, key);

    var listItemsEnter = listItems.enter()
      .append('li')
      .text(R.join('_'));

    listItemsEnter.append('button')
      .attr('class', 'reorderBtn')
      .text(String.fromCharCode(215)) // delete
      .on('click', function(d) {
        var index = R.indexOf(key(d), toKeys(groupOrder));
        window.groupOrder.splice(index, 1);
        update();
      })

    listItemsEnter
      .append('button')
      .attr('class', 'reorderBtn').text(String.fromCharCode(8657)) // up;
      .on('click', function(d) {
        var index = R.indexOf(key(d), toKeys(groupOrder));
        window.groupOrder.splice(index, 1)
        window.groupOrder.splice(Math.max(index - 1, 0), 0, d);
        update();
      })

    listItemsEnter
      .append('button')
      .attr('class', 'reorderBtn').text(String.fromCharCode(8659)) // down;
      .on('click', function(d) {
        var index = R.indexOf(key(d), toKeys(groupOrder));
        window.groupOrder.splice(index, 1)
        window.groupOrder.splice(index + 1, 0, d);
        console.log(window.groupOrder)
        update();
      })

    listItems.order();


    listItems.exit().remove();
  }
}(document.querySelector('.groupOrderControl')));
