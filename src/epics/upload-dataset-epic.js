import { createAction } from "redux-actions";
import { Observable, empty } from "rxjs";
import { catchError, debounceTime, mergeMap, map } from 'rxjs/operators';

import { loadDataset, CSVconvert } from './load-dataset-epic';

// ACTIONS
const uploadDataset = createAction("UPLOAD_DATASET");

// EPIC
const uploadDatasetEpic = (action$, store) => {
  return action$
    .ofType(uploadDataset.toString()).pipe(
      mergeMap((action) => {
        const file = action.payload;
        return fromReader(file).pipe(
            debounceTime(500)
            ,map(CSVconvert)
            ,map(JSON.parse)
            ,map(loadDataset)
            //,takeUntil(action$.ofType(uploadDataset.toString()))
            ,catchError((error) => {
              if (error instanceof SyntaxError) {
                alert("Invalid JSON.");
                return empty();
              } else {
                throw error;
              }
            })
          )
      })
    );
};

/**
 * Little function to create an observable to read local files.
 * RxJS DOM v5 doesn't have it!?
 */
const fromReader = (file) => {
  return Observable.create((observer) => {
    const reader = new window.FileReader();

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
