import { head, tail, map, reduce, path } from "ramda";
import { nest } from "d3-collection";
import { hierarchy as d3Hierarchy } from "d3-hierarchy";

/**
 * Convert an array of nodes into a D3 hierarchy
 *
 * @param [array] data - an array of data
 * @hierarchy [array] - an array of objects in the shape of
 * {
 *   displayName: string,
 *   path: array[string]
 * }
 */

const toHierarchy = (data, hierarchy) => {
  const nesting = nestHierarchy(hierarchy).entries(data);
  const result = entriesToHierarchy("root", null, hierarchy, nesting);
  return d3Hierarchy(result);
};

/**
 * Create the D3 nest function that will nest data given the hierarchy.
 */
const nestHierarchy = (hierarchy) => {
  return reduce(
    (nest, field) => {
      return nest.key((d) => path(field.path, d));
    },
    nest(),
    hierarchy
  );
};

/**
 * Convert nest entries into the format accepted by d3.hierarchy
 */
const entriesToHierarchy = (fieldValue, field, hierarchy, entries) => {
  return {
    fieldValue,
    field,

    children: map((entry) => {
      if (entry.values) {
        return entriesToHierarchy(
          entry.key,
          head(hierarchy),
          tail(hierarchy),
          entry.values
        );
      } else {
        return entry;
      }
    }, entries)
  };
};

export default toHierarchy;
