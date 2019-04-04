import { createAction } from "redux-actions";
import { Observable, of } from "rxjs";
import { catchError, debounceTime, mergeMap, map } from 'rxjs/operators';

import { setError } from "domain/error"

import { loadDataset, CSVconvert } from './load-dataset-epic';

// ACTIONS
const uploadDataset = createAction("UPLOAD_DATASET");

// EPIC
const uploadDatasetEpic = (action$, store) => {
  return action$
    .ofType(uploadDataset.toString()).pipe(
      mergeMap((action) => {
        const owner = action.payload.owner;
        const file = action.payload.file;
        const includeData = ('includeData' in action.payload) ? action.payload.includeData : true;
        const includeControls = ('includeControls' in action.payload) ? action.payload.includeControls: false; 
        return fromReader(owner, includeData, includeControls, file).pipe(
            debounceTime(500)
            ,map(CSVconvert)
            ,map(fromJson)
            ,map(loadDataset)
            ,catchError((error) => {
              if (error instanceof SyntaxError) {
                const newErr = new Error("Invalid JSON.");
                return of(setError(newErr));
              } else {
                /* istanbul ignore next */
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
const fromReader = (owner, includeData, includeControls, file) => {
  return Observable.create((observer) => {
    const source = file.name;
    const reader = new window.FileReader();

    reader.addEventListener('load', () => {
      observer.next({ 'owner': owner, 'source': source, 'includeData':includeData,
                      'includeControls': includeControls, 'file': reader.result });
      observer.complete();
    });

    reader.addEventListener('error', () => {
      observer.error(reader.error);
      observer.complete();
    });

    reader.readAsText(file)
  });
}

const fromJson = (payload) =>{
  const owner = payload.owner;
  const source = payload.source;
  const content = JSON.parse(payload.file);
  const includeData = ('includeData' in payload) ? payload.includeData : true;
  const includeControls = ('includeControls' in payload) ? payload.includeControls: false;

  return {
    'owner': owner,
    'source': source,
    'content': content, 
    'includeData': includeData,
    'includeControls': includeControls,
  };
}

export default uploadDatasetEpic;
export { uploadDataset, fromJson };
