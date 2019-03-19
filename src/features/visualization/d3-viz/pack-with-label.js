import { packEnclose } from "d3-hierarchy";
import packGrid from "./pack-grid";

/**
 * An adaptation of the circle packing algorithm to reserve spacing at the
 * bottom of each non-leaf circle for labeling.
 */
const packWithLabel = () => {
  let options = {
    // Radius funcion
    // See d3.pack.radius
    radius: null,

    // Layout size
    // See d3.pack.size
    size: [1, 1],

    // Padding constant/function
    // See d3.pack.padding
    padding: () => 30,

    // The packing method for packing siblings node.
    // By default use the packGrid method. Can be set to use D3's packSiblings
    // method instead.
    packSiblings: packGrid
  };

  /**
   * @param root - A D3 hierarchy object
   * @return A `pack` object similar to `d3.pack` but with additional options (see above)
   */
  const pack = (root) => {
    root.x = options.size[0] / 2;
    root.y = options.size[1] / 2;
    const { radius, size, packSiblings } = options;
    const padding =
      typeof options.padding === "function" ? options.padding : () => options.padding;

    if (radius) {
      root
        .eachBefore(radiusLeaf(radius))
        .eachAfter(packChildren(packSiblings, padding, 0.5))
        .eachBefore(translateChild(1));
    } else {
      // If radius is not specified, set each leaf node's radius based on its
      // value, then resize the entire layout to fit options.size
      root
        .eachBefore(radiusLeaf((d) => Math.sqrt(d.value)))
        .eachAfter(packChildren(packSiblings, () => 20, 1))
        .eachAfter(
          packChildren(
            packSiblings,
            padding,
            root.r / Math.min(...size)
          )
        )
        .eachBefore(translateChild(Math.min(...size) / (2 * root.r)));
    }
    return root;
  };

  /**
   * Create an option method for each of the option above.
   * Calling the method without arguments returns the current value.
   * Calling the method with argument sets the option.
   *
   * Example:
   * var pack = packWithLabel(root)
   *              .radius(() => 20)
   * pack.radius() //=> () => 20.
   */
  Object.keys(options).forEach((key) => {
    pack[key] = (...values) => {

      if (values.length === 0) {
        return options[key];
      }
      options[key] = values[0];
      return pack;
    };
  });

  return pack;
};

const radiusLeaf = (radius) => {
  return (node) => {
    if (!node.children) {
      node.r = Math.max(radius(node), 0);
    }
  };
};


/**
 * Pack children of a node, then set the node's radius to enclose all the children
 */
const packChildren = (packSiblings, padding, k) => (node) => {
  if (!node.children) {
    return;
  }

  const children = node.children;
  const paddingSize = padding(node) * k || 0;

  // Padding is implemented by adding it to the children's radii, pack,
  // then returning the radii to their original value.
  if (paddingSize) {
    children.forEach((child) => (child.r += paddingSize));
  }

  packSiblings(children);
  const enclosingRadius = packEnclose(children).r;

  if (paddingSize) {
    children.forEach((child) => (child.r -= paddingSize));
  }

  node.r = enclosingRadius + (0.10 * enclosingRadius) + paddingSize;
};

// Set the the node's children's positions to be inside the node and above the
// space reserved for labeling.
const translateChild = (k) => (node) => {
  const parent = node.parent;
  node.r *= k;

  if (node.labelSize) {
    node.labelSize *= k;
    node.labelY = node.r - node.labelSize / 2;
    node.labelWidth = 2 * Math.sqrt(node.r ** 2 - node.labelY ** 2);
  }

  if (parent) {
    node.x = parent.x + k * node.x;
    node.y = parent.y + k * node.y;
    if (parent.labelSize) {
      node.y -= parent.labelSize / 2;
    }
  }
};

export default packWithLabel;
