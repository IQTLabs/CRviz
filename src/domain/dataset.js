import { createAction, handleActions } from "redux-actions";
import {
  chain,
  concat,
  find,
  fromPairs,
  identity,
  is,
  map,
  merge,
  path,
  pipe,
  propEq,
  sortBy,
  toPairs,
  uniq
} from "ramda";

const defaultState = {
  datasets: {}
};
const defaultItemState = {
  hash: "",
  dataset: [],
  values: {},
  configuration: {
    fields: []
  },
  isFetching: false,
  lastUpdated: null
};

/**
 * Return a string that uniquely identify the field
 */
const getFieldId = (field) => field.path.join(".")

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


// ACTIONS

/**
 * Payload: {
 *   dataset: [], // Array of devices
 *   configuration: {} // Configuration
 * }
*/
const setDataset = createAction("SET_DATASET");
const removeDataset = createAction("REMOVE_DATASET");
const setIsFetching = createAction("SET_IS_FETCHING");

// REDUCERS
const reducer = handleActions(
  {
    [setDataset]: (state, { payload }) => {
      const dataset = payload.dataset;
      const hash = payload.hash;
      const configuration = configurationFor(
        payload.dataset || [],
        payload.configuration || {}
      );

      const values = valuesFor(dataset, configuration);
      const isFetching = false;
      const lastUpdated = new Date();
      state.datasets[hash] = {
        hash: hash,
        dataset: dataset,
        values: values,
        configuration: configuration,
        isFetching: isFetching,
        lastUpdated: lastUpdated
      }
      return { ...state};
    },
    [removeDataset]: (state, { payload }) => {
      const hash = payload.hash;
      if(state.datasets.hasOwnProperty(hash))
        delete state.datasets[hash];

      return { ...state }
    },
    [setIsFetching]: (state, { payload }) => {
      const hash = payload.hash;
      const isFetching = !!payload.isFetching;
      if(state.datasets.hasOwnProperty(hash))
        state.datasets[hash].isFetching = isFetching;
      return { ...state, isFetching};
    }
  },
  defaultState
);

// SELECTORS

const selectDataset = (state, hash) => state.dataset.datasets[hash] && state.dataset.datasets[hash].dataset ? state.dataset.datasets[hash].dataset : defaultItemState.dataset;
const selectConfiguration = (state, hash) => state.dataset.datasets[hash] && state.dataset.datasets[hash].configuration ? state.dataset.datasets[hash].configuration : defaultItemState.configuration;
const selectMergedConfiguration = (state) => {
  let fields = [];
  const ds = state.dataset.datasets;
  for (var key in ds){
    for (var f of ds[key].configuration.fields){ 
      // eslint-disable-next-line no-loop-func
      if(!fields.some(field => field.displayName === f.displayName)){
        fields.push(f);
      }
    }
  }

  return { fields: fields };
}
const selectValues = (state, hash) => state.dataset.datasets[hash] && state.dataset.datasets[hash].values ? state.dataset.datasets[hash].values : defaultItemState.values;
const selectMergedValues = (state) => {
  let vals = {};
  const ds = state.dataset.datasets;
  for (var key in ds){
    for (var v in ds[key].values){
      if(vals.hasOwnProperty(v)){
        const valSet = new Set([...vals[v], ...ds[key].values[v]]);
        vals[v] = [...valSet];
      }
      else {
        vals[v] = ds[key].values[v];
      }
    }
  }

  return vals;
}
const getIsFetching = (state, hash) => state.dataset.datasets[hash] && state.dataset.datasets[hash].isFetching ? state.dataset.datasets[hash].isFetching : defaultItemState.isFetching;
const getLastUpdated = (state, hash) => state.dataset.datasets[hash] && state.dataset.datasets[hash].lastUpdated ? state.dataset.datasets[hash].lastUpdated : defaultItemState.lastUpdated;


export default reducer;

export { setDataset, selectDataset, removeDataset, selectConfiguration, selectMergedConfiguration, selectValues, selectMergedValues, getFieldId, configurationFor, setIsFetching, getIsFetching, getLastUpdated };
