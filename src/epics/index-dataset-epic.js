import { ofType } from 'redux-observable';
import { isNil } from "ramda";
import { of } from "rxjs";
import { mergeMap, map, debounceTime, tap, take } from 'rxjs/operators';


import { setSearchIndex, configurationFor } from "domain/dataset";

const getValue = require("get-value");
const lunr = require("lunr");

const BUILD_INDEX = "BUILD_INDEX";
const BUILD_INDEX_SUCCESS = "BUILD_INDEX_SUCCESS";
//const BUILD_INDEX_FAILURE = "BUILD_INDEX_FAILURE";

const buildIndex = (payload) => ({'type': BUILD_INDEX, 'payload': payload })
const buildIndexSuccess = (payload) => ({'type': BUILD_INDEX_SUCCESS, 'payload': payload})

const getSearchIndex = (state) => state.index.searchIndex;

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

const index = (state = { searchIndex: null }, action) => {
  switch (action.type) {
    case BUILD_INDEX_SUCCESS:
      const searchIndex = action.payload
      console.log(searchIndex);
      return {...state, searchIndex};
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
  console.log(payload);
  const dataset = payload.dataset;
  const configuration = payload.configuration || configurationFor(dataset);
  var flat = flattenDataset(dataset, configuration);
  const idx = lunr(function () {
    this.ref('id');
    configuration.fields.map((field) => { return this.field(field.displayName); })
    flat.map((item) => { return this.add(item); })
  });
  return idx;
};

export default indexDatasetEpic;

export { buildIndex, index,  getSearchIndex };
