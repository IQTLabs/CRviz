import { createAction } from "redux-actions";
import { isNil } from 'ramda'
import { Observable } from "rxjs";

import * as lunr from 'lunr';
import * as getValue from 'get-value';

import { setSearchResults } from "domain/dataset";

const searchDataset = createAction("SEARCH_DATASET");

const searchDatasetEpic = (action$, store) => {
  return action$
    .ofType(searchDataset.toString())
    .mergeMap(({ payload }) => {
      return Observable.of(payload)
        .do(performSearch)
        .map((payload) =>
          setSearchResults({
            queryString: payload.queryString,
            results: payload.results
          })
        )
    });
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

const performSearch = (data) => {
  data.results = [];
  var flat = flattenDataset(data.dataset, data.configuration);
  var toFind = data.queryString || '';

  var idx = lunr(function () {
    this.ref('id');
    for(var f in data.configuration.fields){
      this.field(data.configuration.fields[f].displayName);
    }

    for(var i in flat){
      this.add(flat[i]);
    }
  });
  console.log(idx);
  var results = idx.search(toFind);
  console.log(results);

  data.dataset.forEach((el) => { el.isSearchResult = false; });

  for(var key in results){
    var index = results[key].ref;
    data.dataset[index].isSearchResult = true;
    data.results.push(data.dataset[index]);
  }
};

const objectContainsValue = (obj, toFind) => {
  var retVal = false;
  for(var key in obj){
    if(typeof(obj[key]) === "string" && obj[key].toUpperCase().includes(toFind.toUpperCase())){
      retVal =  true;
    } else if(typeof(obj[key]) === "object"){
      retVal = objectContainsValue(obj[key], toFind);
    }

    if(retVal === true)
      break;
  }
  return retVal
};

export default searchDatasetEpic;

export { searchDataset };
