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
        const name = action.payload.name;
        const shortName = action.payload.shortName;
        const file = action.payload.file;
        const includeData = ('includeData' in action.payload) ? action.payload.includeData : true;
        const includeControls = ('includeControls' in action.payload) ? action.payload.includeControls: false; 
        const includeNotes = ('includeNotes' in action.payload) ? action.payload.includeNotes: false; 
        return fromReader(owner, name, shortName, includeData, includeControls, includeNotes ,file).pipe(
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
const fromReader = (owner, name, shortName, includeData, includeControls, includeNotes, file) => {
  return Observable.create((observer) => {
    const source = file.name;
    const reader = new window.FileReader();

    reader.addEventListener('load', () => {
      observer.next({ 'owner': owner, 'name': name, 'shortName': shortName, 'source': source, 'includeData':includeData,
                      'includeControls': includeControls,'includeNotes':includeNotes, 'file': reader.result });
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
  const name = payload.name;
  const shortName = payload.shortName;
  const source = payload.source;
  const content = JSON.parse(payload.file);
  const includeData = ('includeData' in payload) ? payload.includeData : true;
  const includeControls = ('includeControls' in payload) ? payload.includeControls: false;
  const includeNotes = ('includeNotes' in payload) ? payload.includeNotes: false;

  return {
    'owner': owner,
    'name': name,
    'shortName': shortName,
    'source': source,
    'content': content, 
    'includeData': includeData,
    'includeControls': includeControls,
    'includeNotes': includeNotes,
  };
}

export default uploadDatasetEpic;
export { uploadDataset, fromJson };
