import { is } from "ramda";
import { createAction } from "redux-actions";
import { of, empty } from "rxjs";
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { QueryParseError } from 'lunr';


import { setSearchResults} from "./index-dataset-epic";

const searchDataset = createAction("SEARCH_DATASET");

const searchDatasetEpic = (action$, store) => {
  return action$
    .ofType(searchDataset.toString()).pipe(
      mergeMap(({ payload }) => {
        return of(payload).pipe(
            tap(performSearch)
            ,map((payload) =>
              setSearchResults({
                queryString: payload.queryString,
                results: payload.results || []
              })
            )
            ,catchError((error) => {
              if (is(QueryParseError, error)) {
                alert(error.message);
                return empty();
              } else {
                throw error;
              }
            })
          );
      })
    );
};

const performSearch = (data) => {
  data.results = [];
  var toFind = data.queryString || '';
  const idx = data.searchIndex;
  var results = [];
  if(idx && toFind){
    results = idx.search(toFind.toLowerCase());
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
