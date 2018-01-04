(function() {

var constant = R.always;
var constantZero = R.always(0);

var optional = function optional(f) {
  return f == null ? null : required(f);
};

var required = function required(f) {
  if (typeof f !== "function") throw new Error;
  return f;
}

function defaultRadius(d) {
  return Math.sqrt(d.value);
}

window.packWithLabel = function() {
  var radius = null,
    dx = 1,
    dy = 1,
    padding = constantZero;

  function pack(root) {
    root.x = dx / 2, root.y = dy / 2;
    if (radius) {
      root.eachBefore(radiusLeaf(radius))
        .eachAfter(packChildren(padding, 0.5))
        .eachBefore(translateChild(1));
    } else {
      root.eachBefore(radiusLeaf(defaultRadius))
        .eachAfter(packChildren(constantZero, 1))
        .eachAfter(packChildren(padding, root.r / Math.min(dx, dy)))
        .eachBefore(translateChild(Math.min(dx, dy) / (2 * root.r)));
    }
    return root;
  }

  pack.radius = function(x) {
    return arguments.length ? (radius = optional(x), pack) : radius;
  };

  pack.size = function(x) {
    return arguments.length ? (dx = +x[0], dy = +x[1], pack) : [dx, dy];
  };

  pack.padding = function(x) {
    return arguments.length ? (padding = typeof x === "function" ? x : constant(+x), pack) : padding;
  };

  return pack;
}

function radiusLeaf(radius) {
  return function(node) {
    if (!node.children) {
      node.r = Math.max(0, +radius(node) || 0);
    }
  };
}

function packChildren(padding, k) {
  return function(node) {
    if (children = node.children) {
      var children,
          i,
          n = children.length,
          paddingSize = padding(node) * k || 0,
          e;

      if (paddingSize) for (i = 0; i < n; ++i) children[i].r += paddingSize;
      packSiblings(children);
      e = d3.packEnclose(children).r;
      if (paddingSize) for (i = 0; i < n; ++i) children[i].r -= paddingSize;

      node.r = e + paddingSize;

      if (node.depth > 0) {
        var ratio = 0.15;
        var expandAmt = 2 * ratio * node.r;
        var expandedRadius = node.r + expandAmt;
        node.labelSize = expandAmt * 2;
        node.r = expandedRadius;
      }
    }
  };
}

function translateChild(k) {
  return function(node) {
    var parent = node.parent;
    node.r *= k;

    if (node.labelSize) {
      node.labelSize *= k;
    }

    if (parent) {
      node.x = parent.x + k * node.x;
      node.y = parent.y + k * node.y;
      if (parent.labelSize) {
        node.y -= parent.labelSize / 2;
        node.y -= 0;
      }
    }
  };
}
}());
