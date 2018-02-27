import { createAction } from 'redux-actions';
import { Observable } from 'rxjs';

import { setDataset } from 'domain/dataset';
import { setHierarchyConfig } from 'domain/controls';

import fakeData from 'features/visualization/fake-data';

// ACTIONS
const fetchDataset = createAction('FETCH_DATASET');

// EPIC
const fetchDatasetEpic = (action$, store) => {
  return action$
    .ofType(fetchDataset.toString())
    .mergeMap((action) => {
      const url = action.payload
      const size = parseInt(url.match(/\/(\d+)$/)[1]);

      return Observable
        .of(fakeData.slice(0, size)).delay(1000) // Fake AJAX call for now
        .map((data) => setDataset({ dataset: data }) )
        .concat(Observable.of(setHierarchyConfig([])))
        // Ignore result if another request has started.
        .takeUntil(action$.ofType(fetchDataset.toString()))
        // TODO: Handle network error
    });
}

export default fetchDatasetEpic;
export { fetchDataset }
