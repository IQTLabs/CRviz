import { createAction } from "redux-actions";
import { Observable } from "rxjs";

import { setHierarchyConfig } from "domain/controls";
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
        .concat(Observable.of(setHierarchyConfig([])))
    });
};

const performSearch = (data) => {
  data.results = [];
  var toFind = data.queryString || '';
  for(var key in data.dataset){
    if(toFind !=='' && objectContainsValue(data.dataset[key], toFind)){
      data.dataset[key].isSearchResult = true;
      data.results.push(data.dataset[key]);
    } else {
      data.dataset[key].isSearchResult = false;
    }
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
