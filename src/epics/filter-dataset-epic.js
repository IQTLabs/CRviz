import { is } from "ramda";
import { createAction } from "redux-actions";
import { of, empty } from "rxjs";
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { QueryParseError } from 'lunr';

import { setError } from "domain/error"
import { getFilter } from "domain/filter"
import { setFilteredDataset } from "domain/dataset"

const filterDataset = createAction("FILTER_DATASET");

const filterDatasetEpic = (action$, store) => {
  return action$
    .ofType(filterDataset.toString()).pipe(
      mergeMap(({ payload}) => {
        const filter = getFilter(store.value);

        if(filter === null)
          return of(empty());

        return of(payload).pipe(
            tap(applyFilter(payload, filter))
            ,map((payload) =>
              setFilteredDataset({
                owner: payload.owner,
                filtered: payload.filtered
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

const applyFilter = (data, filter) => {
  data.filtered = null;
  const dataset = data.dataset;

  if(filter !== null){
    data.filtered = dataset.filter((item) => filter(item));
  }

  return data;
};

export default filterDatasetEpic;

export { filterDataset };