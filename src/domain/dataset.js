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
  datasets: {},
  diffs:[],
  keyFields: [],
  ignoredFields: []
};
const defaultItemState = {
  owner: "",
  dataset: [],
  filtered: null,
  values: {},
  configuration: {
    fields: [],
    keyields: [],
    hashFields: []
  },
  isFetching: false,
  lastUpdated: null,
};

const getHashFields = (allFields, ignoredFields) => {
  if(!ignoredFields || ignoredFields.length === 0){
    return allFields;
  }

  return allFields.filter(f => !ignoredFields.includes(f));
}

const addHashKey = async (keys, obj) => {
  const hashKey = keys.reduce( (h, k) => h + path(k.path, obj) + ":", "");
  obj["HASH_KEY"] = hashKey;
}

const addHashWithoutIgnored = async (fields, obj) => {
  const hash = fields.reduce( (h, f) => h + path(f.path, obj) + "|", "");
  obj["HASH_WITHOUT_IGNORED"] = hash;
}

const applyHashes = async (dataset, configuration) => {
  console.log("Applying Hashes for %o", dataset);
  dataset.forEach((i) => {
    if(configuration.keyFields){
      addHashKey(configuration.keyFields, i);
    }
    addHashWithoutIgnored(configuration.hashFields, i);
  });
};

/**
 * Return a string that uniquely identify the field
 */
const getFieldId = (field) => {
  if(field.path.length >= 1 && field.path[0])
    return field.path.join(".")
  else
    return " ";
}

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
const configurationFor = (dataset, keyFields, ignoredFields, configuration = {}) => {
  const fields = fieldsFor(dataset[0] || {}, configuration.fields);
  const hashFields = getHashFields(fields, ignoredFields);
  return {
    ...configuration,
    fields: fieldsFor(dataset[0] || {}, configuration.fields),
    keyFields: keyFields,
    hashFields: hashFields
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
const setFilteredDataset = createAction("SET_FILTERED_DATASET");
const setDatasetDiff = createAction("SET_DATASET_DIFF");
const removeDataset = createAction("REMOVE_DATASET");
const removeFilteredDataset = createAction("REMOVE_FILTERED_DATASET");
const removeDatasetDiff = createAction("REMOVE_DATASET_DIFF");
const setIsFetching = createAction("SET_IS_FETCHING");
const setKeyFields = createAction("SET_KEY_FIELDS");
const setIgnoredFields = createAction("SET_IGNORED_FIELDS");

// REDUCERS
const reducer = handleActions(
  {
    [setDataset]: (state, { payload }) => {
      const dataset = payload.dataset;
      const owner = payload.owner;
      const keyFields = getKeyFields(state);
      const ignoredFields = getIgnoredFields(state);
      const configuration = configurationFor(
        payload.dataset || [],
        keyFields,
        ignoredFields,
        payload.configuration || {}
      );

      const values = valuesFor(dataset, configuration);
      const isFetching = false;
      const lastUpdated = new Date();
      state.datasets[owner] = {
        dataset: dataset,
        filtered: null,
        values: values,
        configuration: configuration,
        isFetching: isFetching,
        lastUpdated: lastUpdated
      }
      return { ...state};
    },
    [setFilteredDataset]: (state, { payload }) => {
      const filtered = payload.filtered;
      const owner = payload.owner;

      state.datasets[owner].filtered = filtered;
      return { ...state};
    },
    [setDatasetDiff]: (state, { payload }) => {
      const start = payload.start;
      const end = payload.end;
      const differences = payload.differences
      const newDiff = {
        'start': start,
        'end': end,
        'differences': differences
      }

      const idx = state.diffs.findIndex(d => d.start === start && d.end === end);

      if(idx === -1){
        state.diffs.push(newDiff);
      } else {
        state.diffs[idx] = newDiff;
      }
      return { ...state};
    },
    [removeDataset]: (state, { payload }) => {
      const owner = payload.owner;
      if(state.datasets.hasOwnProperty(owner))
        delete state.datasets[owner];

      return { ...state }
    },
    [removeFilteredDataset]: (state, { payload }) => {
      const owner = payload.owner;
      if(state.datasets.hasOwnProperty(owner))
        state.datasets[owner].filtered = null;

      return { ...state }
    },
    [removeDatasetDiff]: (state, { payload }) => {
      const start = payload.start;
      const end = payload.end;
      const idx = state.diffs.findIndex(d => d.start === start && d.end === end);

      if(idx !== -1){
        state.diffs.splice(idx, 1);
      }

      return { ...state }
    },
    [setIsFetching]: (state, { payload }) => {
      const owner = payload.owner;
      const isFetching = !!payload.isFetching;
      if(state.datasets.hasOwnProperty(owner))
        state.datasets[owner].isFetching = isFetching;
      return { ...state, isFetching};
    },
    [setKeyFields]: (state, { payload }) => { 
      const keyFields = payload;
      const datasets = selectDatasets(state);
      console.log(datasets);
      if(state.dataset && state.dataset.datasets){
        Object.keys(state.dataset.datasets).forEach((ds) => {
          ds.configuration.keyFields = keyFields
          applyHashes(ds.dataset, ds.configuration);
        });
      }

      return {...state, keyFields: keyFields };
    },
    [setIgnoredFields]: (state, { payload }) => {
      const ignoredFields = payload;

      if(state.dataset && state.dataset.datasets){
        const allFields = selectMergedConfiguration(state).fields;
        const hashFields = getHashFields(allFields, ignoredFields);

        Object.keys(state.dataset.datasets).forEach((ds) => {      
          ds.configuration.hashFields = hashFields
          applyHashes(ds.dataset, ds.configuration);
        });
      }

      return { ...state, ignoredFields: ignoredFields };
    }
  },
  defaultState
);

// SELECTORS
const selectDatasets = (state) => {
  console.log(state);
  return state.dataset && state.dataset.datasets ? state.dataset.datasets : {};
};
const selectDataset = (state, owner) => state.dataset && state.dataset.datasets[owner] && state.dataset.datasets[owner].dataset ? state.dataset.datasets[owner].dataset : defaultItemState.dataset;
const selectFilteredDataset = (state, owner) => state.dataset && state.dataset.datasets[owner] && state.dataset.datasets[owner].filtered ? state.dataset.datasets[owner].filtered : defaultItemState.filtered;
const selectDatasetDiff = (state, start, end) => {
  let diff = null;
  const idx = state.dataset.diffs.findIndex(d => d.start === start && d.end === end);
  if(idx !== -1){
    diff = state.dataset.diffs[idx].differences;;
  }
  return diff;
}
const selectConfiguration = (state, owner) => state.dataset && state.dataset.datasets[owner] && state.dataset.datasets[owner].configuration ? state.dataset.datasets[owner].configuration : defaultItemState.configuration;
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
const selectValues = (state, owner) => state.dataset && state.dataset.datasets[owner] && state.dataset.datasets[owner].values ? state.dataset.datasets[owner].values : defaultItemState.values;
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
const getIsFetching = (state, owner) => state.dataset.datasets[owner] && state.dataset.datasets[owner].isFetching ? state.dataset.datasets[owner].isFetching : defaultItemState.isFetching;
const getLastUpdated = (state, owner) => state.dataset.datasets[owner] && state.dataset.datasets[owner].lastUpdated ? state.dataset.datasets[owner].lastUpdated : defaultItemState.lastUpdated;
const getKeyFields = (state) => state.dataset && state.dataset.keyFields ? state.dataset.keyFields : [];
const getIgnoredFields = (state) => state.dataset && state.dataset.ignoredFields ? state.dataset.ignoredFields : [];


export default reducer;

export { setDataset, selectDataset, selectDatasets, removeDataset, setFilteredDataset, selectFilteredDataset, removeFilteredDataset, selectConfiguration, selectMergedConfiguration, selectValues, 
  selectMergedValues, getFieldId, configurationFor, setIsFetching, getIsFetching, setKeyFields, getKeyFields, setIgnoredFields, getIgnoredFields, getHashFields, getLastUpdated, valuesFor, 
  setDatasetDiff, removeDatasetDiff, selectDatasetDiff, applyHashes };
