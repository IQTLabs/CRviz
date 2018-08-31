import { is } from "ramda";
import { createAction } from "redux-actions";
import { of } from "rxjs";
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { QueryParseError } from 'lunr';

import { setError } from "domain/error"
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
                return of(setError(error));
              } else {
                /* istanbul ignore next */
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

export default searchDatasetEpic;

export { searchDataset };
