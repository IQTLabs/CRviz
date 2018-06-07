import { createAction } from 'redux-actions';
import { ofType } from 'redux-observable';
import { empty } from 'rxjs';
import { ajax  as rxAjax } from 'rxjs/ajax';
import { catchError, debounceTime, mergeMap, map } from 'rxjs/operators';

import { loadDataset } from './load-dataset-epic';

// ACTIONS
const fetchDataset = createAction('FETCH_DATASET');

// EPIC
const fetchDatasetEpic = (action$, store, ajax = rxAjax) => {
  return action$.pipe(
    ofType(fetchDataset.toString())
    ,debounceTime(500)
    ,mergeMap((action) => {
      const url = action.payload
      return ajax({ url: url, crossDomain: true, responseType: 'json' }).pipe(
        map((result) => { 
          return result.response 
        })
        ,map(loadDataset)
        // I believe this was done oddly and debounce should have been used
        // to ensure that file input was only processed once, instead of using take until
        // which seems to be stopping the epic the second time the action passes through the stream
        // it seems like this change doesn't change functionality and makes unit testing easier
        // I intend to do more thorough user testing later
        //.takeUntil(action$.ofType(fetchDataset.toString()))
        ,catchError((error) => {
          alert("Failed to fetch dataset. Please try again later.");
          return empty();
        })
        );
    })
    );
}

export default fetchDatasetEpic;
export { fetchDataset }
