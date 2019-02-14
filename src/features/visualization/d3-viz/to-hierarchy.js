import { chain, head, tail, map, reduce, path, isNil } from "ramda";
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

const toHierarchy = (data, hierarchyConfig) => {
  const nesting = nestHierarchy(hierarchyConfig).entries(data);
  const result = entriesToHierarchy("root", null, hierarchyConfig, nesting);
  return d3Hierarchy(result);
};

/**
 * Create the D3 nest function that will nest data given the hierarchyConfig.
 */
const nestHierarchy = (hierarchyConfig) => {
  return reduce(
    (nest, field) => {
      return nest.key((d) => path(field.path, d));
    },
    nest(),
    hierarchyConfig
  );
};

const countSearchResults = (children) => {
  if(isNil(children)){
    return 0;
  }

  var result = 0;

  for(var c in children){
    if(!('CRVIZ' in children[c])){
      children[c]['CRVIZ'] = {};
    }
    result += (children[c].CRVIZ._searchResultCount || 0) + (children[c].CRVIZ._isSearchResult || 0) +
              (
                !isNil(children[c].values)
                  ? countSearchResults(children[c].values) : 0
              );
  }

  return result;
};

/**
 * Convert nest entries into the format accepted by d3.hierarchy
 */
const entriesToHierarchy = (fieldValue, field, hierarchyConfig, entries) => {
  if (fieldValue === 'Unknown') {
    return {
      fieldValue,
      field,
      children: chain(getLeaves, entries),
      CRVIZ:{ _SEARCH_RESULT_COUNT: countSearchResults(entries) }
    }
  }

  return {
    fieldValue,
    field,
    children: map((entry) => {
      if (entry.values) {
        return entriesToHierarchy(
          entry.key,
          head(hierarchyConfig),
          tail(hierarchyConfig),
          entry.values
        );
      } else {
        return entry;
      }
    }, entries),
    CRVIZ:{ _SEARCH_RESULT_COUNT: countSearchResults(entries) }
  };
};

const getLeaves = (entry) => {
  if (entry.values) {
    return chain(getLeaves, entry.values)
  } else {
    return [entry]
  }
}

export default toHierarchy;
