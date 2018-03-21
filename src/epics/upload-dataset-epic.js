import { createAction } from "redux-actions";
import { Observable } from "rxjs";

import { loadDataset } from './load-dataset-epic';

// ACTIONS
const uploadDataset = createAction("UPLOAD_DATASET");

// EPIC
const uploadDatasetEpic = (action$, store) => {
  return action$
    .ofType(uploadDataset.toString())
    .mergeMap((action) => {
      const file = action.payload;
      return fromReader(file)
        .map(JSON.parse)
        .map(loadDataset)
        .takeUntil(action$.ofType(uploadDataset.toString()))
        .catch((error) => {
          if (error instanceof SyntaxError) {
            alert("Invalid JSON.");
            return Observable.empty();
          } else {
            throw error;
          }
        })
    });
};

/**
 * Little function to create an observable to read local files.
 * RxJS DOM v5 doesn't have it!?
 */
const fromReader = (file) => {
  return Observable.create((observer) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      observer.next(reader.result);
      observer.complete();
    });

    reader.addEventListener('error', () => {
      observer.error(reader.error);
      observer.complete();
    });

    reader.readAsText(file)
  });
}

export default uploadDatasetEpic;
export { uploadDataset };
