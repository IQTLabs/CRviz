import { createAction } from 'redux-actions';
import { Observable } from 'rxjs';

import { loadDataset } from './load-dataset-epic';

// ACTIONS
const fetchDataset = createAction('FETCH_DATASET');

// EPIC
const fetchDatasetEpic = (action$, store, ajax = Observable.ajax) => {
  return action$
    .ofType(fetchDataset.toString())
    .debounceTime(500)
    .mergeMap((action) => {
      const url = action.payload
      return ajax({ url: url, crossDomain: true, responseType: 'json' })
        .map((result) => { 
          return result.response 
        })
        .map(loadDataset)
        // I believe this was done oddly and debounce should have been used
        // to ensure that file input was only processed once, instead of using take until
        // which seems to be stopping the epic the second time the action passes through the stream
        // it seems like this change doesn't change functionality and makes unit testing easier
        // I intend to do more thorough user testing later
        //.takeUntil(action$.ofType(fetchDataset.toString()))
        .catch((error) => {
          alert("Failed to fetch dataset. Please try again later.");
          return Observable.empty();
        });
    });
}

export default fetchDatasetEpic;
export { fetchDataset }
