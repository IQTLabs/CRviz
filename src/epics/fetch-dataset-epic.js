import { createAction } from 'redux-actions';
import { ofType } from 'redux-observable';
import { of } from 'rxjs';
import { ajax  as rxAjax } from 'rxjs/ajax';
import { catchError, debounceTime, mergeMap, map } from 'rxjs/operators';

import { setError } from "domain/error";
import { loadDataset } from './load-dataset-epic';

// ACTIONS
const fetchDataset = createAction('FETCH_DATASET');

// EPIC
const fetchDatasetEpic = (action$, store, ajax = rxAjax) => {
  return action$.pipe(
    ofType(fetchDataset.toString())
    ,debounceTime(500)
    ,mergeMap((action) => {
      const url = action.payload.url
      const header = action.payload.header
      return ajax({ 'url': url, 'headers':header, 'crossDomain': true, 'responseType': 'json' }).pipe(
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
          const newErr = new Error("Error fetching dataset: " + error.message);
          return of(setError(newErr));
        })
      );
    })
  );
}

const getScheme = (username, password, token) =>{
   let scheme = 'None';
    if(token) {
      scheme = 'Bearer'
    } else if (username && password) {
      scheme = 'Basic'
    }
    return scheme;
}

const buildAuthHeader = (username, password, token) => {
  let header = null;
  var scheme = getScheme(username, password, token);

  switch (scheme){
    case 'Basic':
       var basic = "Basic " + new Buffer(`${username}:${password}`).toString("base64");
       header = {'Authorization' : basic};
      break;
    case 'Bearer':
      var bearer = `Bearer ${token}`;
      header = {'Authorization' : bearer};
      break;
    default:
      header = null;
      break;
  }
  
  return header;
}

export default fetchDatasetEpic;
export { fetchDataset, buildAuthHeader };