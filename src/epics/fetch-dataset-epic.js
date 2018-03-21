import { createAction } from 'redux-actions';
import { Observable } from 'rxjs';

import { loadDataset } from './load-dataset-epic';

// ACTIONS
const fetchDataset = createAction('FETCH_DATASET');

// EPIC
const fetchDatasetEpic = (action$, store) => {
  return action$
    .ofType(fetchDataset.toString())
    .mergeMap((action) => {
      const url = action.payload

      return Observable
        .ajax({ url: url, crossDomain: true, responseType: 'json' })
        .map((result) => result.response )
        .map(loadDataset)
        .takeUntil(action$.ofType(fetchDataset.toString()))
        .catch((error) => {
          alert("Failed to fetch dataset. Please try again later.");
          return Observable.empty();
        });
    });
}

export default fetchDatasetEpic;
export { fetchDataset }
