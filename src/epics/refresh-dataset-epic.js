import { createAction } from 'redux-actions';
import { ofType } from 'redux-observable';
import {  timer } from 'rxjs';
import { mergeMap, mapTo, takeUntil, debounceTime } from 'rxjs/operators';


import { fetchDataset } from './fetch-dataset-epic';

// ACTIONS
const startRefresh = createAction('START_REFRESH_DATASET');
const stopRefresh = createAction('STOP_REFRESH_DATASET');

// EPIC
const refreshDatasetEpic = (action$, store) => {
  return action$.pipe(
    ofType(startRefresh.toString())
    ,debounceTime(500)
    ,mergeMap((action) => {
      const url = action.payload.url;
      const header = action.payload.header;
      const interval = action.payload.interval * 1000;
      return timer(0, interval).pipe(
        mapTo(fetchDataset({ 'url': url, 'header':header}))
        ,takeUntil(action$.ofType(stopRefresh.toString()))
        )
    })  
  );
}

export default refreshDatasetEpic;
export { startRefresh, stopRefresh };