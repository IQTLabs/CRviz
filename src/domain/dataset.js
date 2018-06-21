import { createAction, handleActions } from "redux-actions";
import {
  chain,
  concat,
  find,
  fromPairs,
  identity,
  is,
  isNil,
  map,
  merge,
  path,
  pipe,
  propEq,
  sortBy,
  toPairs,
  uniq
} from "ramda";

const getValue = require("get-value");
const lunr = require("lunr");

const defaultState = {
  dataset: [],
  values: {},
  configuration: {
    fields: []
  },
  searchIndex: {},
  results: [],
  queryString:''
};

/**
 * Returns an array of paths to literal values and arrays in a POJO.
 *
 * Example:
 * pathsIn({ a: 'A', b: { c: 'C', d: [1, 2] } }) //=> [['a'], ['b', 'c'], ['b', 'd']]
 */
const pathsIn = (obj) =>
  chain(
    ([key, value]) =>
      is(Object, value) ? map(concat([key]), pathsIn(value)) : [[key]],
    toPairs(obj)
  );

/**
 * Return a string that uniquely identify the field
 */
const getFieldId = (field) => field.path.join(".")

/**
 * Return all fields for an object
 */
const fieldsFor = (obj, overrides = []) => {
  const paths = pathsIn(obj);
  return map((path) => {
    const override = find(propEq('path', path), overrides) || {};
    return merge(
      {
        path: path,
        displayName: path.join('.'),
        groupable: true
      },
      override
    )
  }, paths);

  // var fields = difference(pathsIn(obj), map(prop('path'), overrides));
  // return [
  //   ...overrid,
  //   ...map(
  //     (path) => ({
  //       path: path,
  //       displayName: path.join("."),
  //       groupable: true
  //     }),
  //     unspecified
  //   )
  // ];
};

/**
 * Returns a configuration with any missing items populated
 */
const configurationFor = (dataset, configuration = {}) => {
  return {
    ...configuration,
    fields: fieldsFor(dataset[0] || {}, configuration.fields)
  };
};


const valuesFor = (dataset, configuration) => {
  return fromPairs(map((field) => {
    const values = pipe(
      map(path(field.path)),
      uniq,
      sortBy(identity)
    )(dataset);

    return [getFieldId(field), values];
  }, configuration.fields));
};

const flattenDataset = (ds, cfg) => {
  var flattened = [];

  if(isNil(cfg))
    return flattened;

  for(var key in ds){
    var item = {'id':key};
    for(var f in cfg.fields){
      var field = cfg.fields[f];

      var name = field.displayName
      item[name] = getValue(ds[key], field.displayName);
    }
    flattened.push(item);
  }
  return flattened;
}

const buildIndex = (dataset, configuration) => {
  var flat = flattenDataset(dataset, configuration);
  const idx = lunr(function () {
    this.ref('id');
    configuration.fields.map((field) => { return this.field(field.displayName); })
    flat.map((item) => { return this.add(item); })
  });
  return idx;
};

// ACTIONS

/**
 * Payload: {
 *   dataset: [], // Array of devices
 *   configuration: {} // Configuration
 * }
*/
const setDataset = createAction("SET_DATASET");
const setSearchResults = createAction("SET_SEARCHRESULTS");

// REDUCERS
const reducer = handleActions(
  {
    [setDataset]: (state, { payload }) => {
      const dataset = payload.dataset;

      const configuration = configurationFor(
        payload.dataset || [],
        payload.configuration || {}
      );

      const values = valuesFor(dataset, configuration);
      const searchIndex = buildIndex(dataset, configuration);

      return { ...state, dataset, values, configuration, searchIndex };
    },
    [setSearchResults]: (state, { payload }) => {
      const results = payload.results;
      const queryString = payload.queryString;
      return { ...state, results, queryString}
    }
  },
  defaultState
);

// SELECTORS

const selectDataset = (state) => state.dataset.dataset;
const selectConfiguration = (state) => state.dataset.configuration;
const selectValues = (state) => state.dataset.values;
const getSearchIndex = (state) => state.dataset.searchIndex;
const getSearchResults = (state) => state.dataset.results;
const getQueryString = (state) => state.dataset.queryString;

export default reducer;

export { setDataset, selectDataset, selectConfiguration, selectValues, getFieldId , setSearchResults, getSearchResults, getSearchIndex, getQueryString};
