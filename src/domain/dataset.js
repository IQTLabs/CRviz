import { createAction, handleActions } from "redux-actions";
import {
  chain,
  concat,
  fromPairs,
  identity,
  is,
  map,
  path,
  pipe,
  sortBy,
  toPairs,
  uniq
} from "ramda";

const defaultState = {
  dataset: [],
  values: {},
  configuration: {
    fields: []
  }
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
const fieldsFor = (obj) => {
  var paths = pathsIn(obj);

  return map(
    (path) => ({
      path: path,
      displayName: path.join(".")
    }),
    paths
  );
};

/**
 * Returns a configuration with missing items populated
 */
const configurationFor = (dataset, configuration = {}) => {
  return {
    ...configuration,
    fields: configuration.fields || fieldsFor(dataset[0] || {})
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

// ACTIONS

/**
 * Payload: {
 *   dataset: [], // Array of devices
 *   configuration: {} // Configuration
 * }
*/
const setDataset = createAction("SET_DATASET");

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

      return { ...state, dataset, values, configuration }
    }
  },
  defaultState
);

// SELECTORS

const selectDataset = (state) => state.dataset.dataset;
const selectConfiguration = (state) => state.dataset.configuration;
const selectValues = (state) => state.dataset.values;

export default reducer;

export { setDataset, selectDataset, selectConfiguration, selectValues, getFieldId };
