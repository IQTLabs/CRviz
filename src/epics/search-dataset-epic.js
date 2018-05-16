import { createAction } from "redux-actions";
import { isNil } from "ramda";
import { Observable } from "rxjs";

import { setSearchResults} from "domain/dataset";

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

const performSearch = (data) => {
  data.results = [];
  var toFind = data.queryString || '';
  const idx = data.searchIndex;

  var results = [];
  if(!isNil(idx)){
    results = idx.search(toFind);
  }

  data.dataset.forEach((el) => { el.isSearchResult = false; });
  results.forEach((r) => {
    data.dataset[r.ref].isSearchResult = true;
    data.results.push(data.dataset[r.ref]);
  });
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
