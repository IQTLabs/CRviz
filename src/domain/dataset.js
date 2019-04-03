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
  uniq,
  memoizeWith,
} from "ramda";

const defaultState = {
  datasets: {},
  diffs:[],
  keyFields: [],
  ignoredFields: []
};
const defaultItemState = {
  owner: "",
  source: null,
  name: "",
  shortName: "",
  dataset: [],
  filtered: null,
  values: {},
  configuration: {
    fields: [],
    keyFields: [],
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

const addHashKey = (keys, obj) => {
  //console.log("addHashKey keys: %o", keys);
  const hashKey = keys.reduce( (h, k) => h + path(k.path, obj) + ":", "");
  obj.CRVIZ["_HASH_KEY"] = hashKey;
}

const addHashWithoutIgnored = (fields, obj) => {
  const hash = fields.reduce( (h, f) => h + path(f.path, obj) + "|", "");
  obj.CRVIZ["_HASH_WITHOUT_IGNORED"] = hash;
}

const applyHashes = (dataset, configuration) => {
  dataset.forEach((i) => {
    if(!('CRVIZ' in i)){
      i['CRVIZ'] = {};
    }
    if(!configuration.hashFields){
      configuration.hashFields = getHashFields(configuration.fields, configuration.ignoredFields || []);
    }

    addHashKey(configuration.keyFields.length > 0 ? configuration.keyFields : configuration.hashFields, i);
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
  const paths = pathsIn(obj).filter(p => p[0] !== 'CRVIZ');
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

const configureDataset = (dataset, source, name, shortName, initialConfig, keyFields, ignoredFields) => {
  const configuration = configurationFor(
    dataset || [],
    keyFields,
    ignoredFields,
    initialConfig || {}
  );
  applyHashes(dataset, configuration);

  const values = valuesFor(dataset, configuration);
  const isFetching = false;
  const lastUpdated = new Date();
  return {
    dataset: dataset,
    source: source,
    name: name,
    shortName: shortName,
    filtered: null,
    values: values,
    configuration: configuration,
    isFetching: isFetching,
    lastUpdated: lastUpdated
  }
}

// ACTIONS

/**
 * Payload: {
 *   dataset: [], // Array of devices
 *   configuration: {} // Configuration
 * }
*/
const setDatasets = createAction("SET_DATASETS");
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
    [setDatasets]: (state, { payload }) => {
      const datasets = payload.datasets;
      Object.keys(datasets).forEach((key) => {
        state.datasets[key] = datasets[key];
      })
      
      return { ...state};
    },
    [setDataset]: (state, { payload }) => {
      const dataset = payload.dataset;
      const owner = payload.owner;
      const source = payload.source;
      const name = payload.name;
      const shortName = payload.shortName;
      const initialConfig = payload.configuration;
      const keyFields = getKeyFields(state);
      const ignoredFields = getIgnoredFields(state);
      state.datasets[owner] = configureDataset(dataset, source, name, shortName, initialConfig, keyFields, ignoredFields);
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
      const datasets = _selectDatasets(state);
      if(datasets){
        Object.keys(datasets).forEach((key) => {
          const ds = datasets[key];
          ds.configuration.keyFields = keyFields;
          applyHashes(ds.dataset, ds.configuration);
        });
      }

      return {...state, keyFields: keyFields };
    },
    [setIgnoredFields]: (state, { payload }) => {
      const ignoredFields = payload;
      const datasets = _selectDatasets(state);

      if(datasets){
        const allFields = _selectMergedConfiguration(state).fields;
        const hashFields = getHashFields(allFields, ignoredFields);

        Object.keys(datasets).forEach((key) => {
          const ds = datasets[key];    
          ds.configuration.hashFields = hashFields
          applyHashes(ds.dataset, ds.configuration);
        });
      }

      return { ...state, ignoredFields: ignoredFields };
    }
  },
  defaultState
);

//methods where we need to deal with state both inside and outside of the reducer
//outside of the reducer state represents the entire state tree, but inside of the
//reducer the provided state is only the state for the reducer's subset of the 
//state tree.  to avoid duplication of code these methods will be called be used
//internally from the reducer.  and methods that recieve the full state tree will 
//pare the tree down to just the relevant attributes. in these cases the
//variable "dataset" will represent the segment of the state tree owned by the datset reducer.
const _selectDatasets = (dataset) => {
  return dataset.datasets || {};
}
const _selectMergedConfiguration = (dataset) => {
  let fields = [];
  const ds = dataset.datasets;
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

// SELECTORS
const selectDatasets = (state) => {
  return _selectDatasets(state.dataset);
}
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
  return _selectMergedConfiguration(state.dataset)
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

const memoizeKey = (state, startOwner, endOwner) => {
  const startUpdated = state.dataset && state.dataset.datasets[startOwner] ? state.dataset.datasets[startOwner].lastUpdated : "NotUpdated";
  const endUpdated = state.dataset && state.dataset.datasets[endOwner] ? state.dataset.datasets[endOwner].lastUpdated : "NotUpdated";
  return startOwner+":"+startUpdated+"-"+endOwner+":"+endUpdated
};

const selectDatasetIntersection = memoizeWith(memoizeKey, (state, startOwner, endOwner) => {
  let ds = [];
  const start = selectDataset(state, startOwner);
  const end = selectDataset(state, endOwner);
  
  if(start.length > 0 && end.length === 0){
    start.forEach((s) => {
      s.CRVIZ._isRemoved = false;
      s.CRVIZ._isChanged = false;
      s.CRVIZ._isAdded = false;
    });
    ds = start;
  } else if(start.length === 0 && end.length > 0){
    end.forEach((e) => {
      e.CRVIZ._isRemoved = false;
      e.CRVIZ._isChanged = false;
      e.CRVIZ._isAdded = false;
    });
    ds = end;
  } else if(start.length > 0 && end.length > 0) {
    start.forEach((s) => {
      s.CRVIZ._isRemoved = false;
      s.CRVIZ._isChanged = false;
      s.CRVIZ._isAdded = false;
      const idx = end.findIndex(e => e.CRVIZ._HASH_KEY === s.CRVIZ._HASH_KEY);
      if(idx === -1){
        s.CRVIZ._isRemoved = true;
      } else {
        s.CRVIZ._isRemoved = false;
      }
      s.CRVIZ._isChanged = false;
      s.CRVIZ._isAdded = false;
      ds.push(s);
    });
    end.forEach((e) => {
      e.CRVIZ._isRemoved = false;
      e.CRVIZ._isChanged = false;
      e.CRVIZ._isAdded = false;
      const idx = ds.findIndex(i => i.CRVIZ._HASH_KEY === e.CRVIZ._HASH_KEY);
      if(idx === -1){
        e.CRVIZ._isAdded = true;
        ds.push(e);
      } else if(ds[idx].CRVIZ._HASH_WITHOUT_IGNORED !== e.CRVIZ._HASH_WITHOUT_IGNORED){
        ds[idx].CRVIZ._isChanged = true;
      }
    })
  }
  return ds;
});


export default reducer;

export { setDatasets, setDataset, selectDataset, selectDatasets, removeDataset, setFilteredDataset, selectFilteredDataset, removeFilteredDataset, selectConfiguration, selectMergedConfiguration,
  selectValues, selectMergedValues, getFieldId, configurationFor, setIsFetching, getIsFetching, setKeyFields, getKeyFields, setIgnoredFields, getIgnoredFields, getHashFields, getLastUpdated, 
  valuesFor, setDatasetDiff, removeDatasetDiff, selectDatasetDiff, selectDatasetIntersection, applyHashes, configureDataset };
