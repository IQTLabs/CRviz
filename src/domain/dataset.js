import { createAction, handleActions } from "redux-actions";
import { toPairs, is, map, chain, concat } from "ramda";

const defaultState = {
  dataset: [],
  configuration: null
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

// ACTIONS

const setDataset = createAction("SET_DATASET");

// REDUCERS
const reducer = handleActions(
  {
    [setDataset]: (state, { payload }) => ({
      ...state,
      dataset: payload.dataset,
      configuration: configurationFor(payload.dataset, payload.configuration)
    })
  },
  defaultState
);

// SELECTORS

const selectDataset = (state) => state.dataset.dataset;
const selectConfiguration = (state) => state.dataset.configuration;

export default reducer;

export { setDataset, selectDataset, selectConfiguration };
