import { ofType } from 'redux-observable';
import { isNil } from "ramda";
import { of } from "rxjs";
import { mergeMap, map } from 'rxjs/operators';

import { configurationFor } from "domain/dataset";

const getValue = require("get-value");
const lunr = require("lunr");

const BUILD_INDEX = "BUILD_INDEX";
const BUILD_INDEX_SUCCESS = "BUILD_INDEX_SUCCESS";
const REMOVE_SEARCH_INDEX = "REMOVE_SEARCH_INDEX";
//const BUILD_INDEX_FAILURE = "BUILD_INDEX_FAILURE";
const SET_SEARCH_RESULTS = "SET_SEARCH_RESULTS";

const buildIndex = (payload) => ({'type': BUILD_INDEX, 'payload': payload })
const buildIndexSuccess = (payload) => ({'type': BUILD_INDEX_SUCCESS, 'payload': payload})
const removeSearchIndex = (payload) => ({'type': REMOVE_SEARCH_INDEX, 'payload': payload});
const setSearchResults = (payload) => ({'type': SET_SEARCH_RESULTS, 'payload': payload })

const getSearchResults = (state) => state.search.searchResults || [];
const getQueryString = (state) => state.search.queryString;
const getSearchIndex = (state, owner) => state.search.searchIndices[owner] || null;
const getSearchIndices = (state) => state.search.searchIndices || [];

const indexDatasetEpic = (action$, store) => {
  return action$.pipe(
      ofType(BUILD_INDEX)
      ,mergeMap(({ payload }) => {
        return of(payload).pipe(
            map(generateIndex)
            ,map((payload) =>
              buildIndexSuccess(payload)
            )
          );
      })
    );
};

const searchReducer = (state = { searchIndices: {}, queryString: '', searchResults: null }, action) => {
  switch (action.type) {
    case BUILD_INDEX_SUCCESS:
      const biowner = action.payload.owner;
      const searchIndex = action.payload.index;
      state.searchIndices[biowner] = searchIndex;
      return {...state };
    case 
    SET_SEARCH_RESULTS:
      const searchResults = action.payload.results;
      const queryString = action.payload.queryString;
      return { ...state, searchResults, queryString};
    case 
    REMOVE_SEARCH_INDEX:
      const rsowner = action.payload.owner;
      if(state.searchIndices.hasOwnProperty(rsowner))
        delete state.searchIndices[rsowner];

      return { ...state }
    default:
      return state;
  }
}

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

const generateIndex = (payload) => {
  const owner = payload.owner;
  const dataset = payload.dataset;
  const configuration = payload.configuration || configurationFor(dataset);
  var flat = flattenDataset(dataset, configuration);
  const idx = lunr(function () {
    this.ref('id');
    if(configuration && configuration.fields){
      configuration.fields.map((field) => { return this.field(field.displayName.toLowerCase()); })
    }
    flat.map((item) => { return this.add(item); })
  });
  return { owner: owner, index: idx };
};

export default indexDatasetEpic;

export { buildIndex, searchReducer,  getSearchIndex, removeSearchIndex, getSearchIndices, setSearchResults, getSearchResults, getQueryString };
