import { createAction } from "redux-actions";
import { ofType } from 'redux-observable';
import { of } from "rxjs";
import { map, mergeMap, catchError, concat } from 'rxjs/operators';
import { isNil, is } from "ramda";

import hash from "hash-it"

import { buildIndex } from './index-dataset-epic';

import { setError } from "domain/error"
import { setDataset } from "domain/dataset";
import { setHierarchyConfig, colorBy } from "domain/controls";

const loadDataset = createAction("LOAD_DATASET");

const loadDatasetEpic = (action$, store) => {
  return action$.pipe(
    ofType(loadDataset.toString())
    ,mergeMap(({ payload }) => {
      return of(payload).pipe(
        map(formatPayload)
        ,mergeMap((payload) => {
          const dsHash = hash(payload.dataset);
          return of(
            setDataset({
              hash: dsHash,
              dataset: payload.dataset,
              configuration: payload.configuration
            })
            ,buildIndex({
                hash: dsHash,
                dataset: payload.dataset,
                configuration: payload.configuration || null
            })
          )
        })
        ,concat(of(setHierarchyConfig(store.value.controls.hierarchyConfig || []), colorBy(store.value.controls.colorBy)))
        ,catchError((error) => {
          if (is(ValidationError, error)) {
            return of(setError(error));
          } else {
            /* istanbul ignore next */
            throw error;
          }
        })
      );
    })
  );
}; 

// doesn't really care if it's not CSV; if it *is* CSV, convert to JSON.
// Otherwise, just pass it along.
const CSVconvert = (data) => {
  var lines = data.trim().split(/[\r\n]+/g);
  if (lines.length < 2) { // bail if there's not even linebreaks
    return data;
  }

  function finddelim(hdr) {
    var delims = [',','|','\t',';']
    var delim = 0
    var max = -1
    for (var i=0; i < hdr.length; i++) {
      if (max < hdr.split(delims[i]).length-1) {
        max = hdr.split(delims[i]).length-1
        delim = i
      }
    }
    return delims[delim];
  }

  var delimiter = finddelim(lines[0])
  var jsonstring = '['
  var colnames = lines[0].split(delimiter)
  for (var i=1; i < lines.length; i++) {
    var entry = lines[i].split(delimiter)
    if (entry.length !== colnames.length) { // malformed CSV, or not even CSV.
      return data;
    }
    jsonstring += "{ "
    for (var j=0; j < colnames.length; j++) {
      jsonstring += '"'+colnames[j]+'": "'+entry[j]+'"';
      if (j < colnames.length-1 ) {
        jsonstring += ", "
      } else {
        jsonstring += " }"
        if (i < lines.length-1) {
          jsonstring += ",\n"
        }
      }
    }
  }
  jsonstring += ']'
  return jsonstring;
}

//if we have a naked array or an object not containing a dataset instead of an object containing a dataset
//transfer the array into an object's dataset to maintain a consistent
//schema with what is used elsewhere see https://github.com/CyberReboot/CRviz/issues/33
const formatPayload = (data) => {
  var config = data.configuration;
  var temp = {};
  if(!isNil(data.dataset) && is(Array, data.dataset)){
    temp = data.dataset;
  } else if(isNil(data.dataset) && is(Array, data)) {
    temp  = data;
  } else if(isNil(data.dataset)) {
    let obj = {};
    Object.entries(data).forEach( (entry) =>{
      let key = entry[0];
      let value = entry[1]
      obj[key] = value;
      })
    temp = [obj];
  } else {
    throw ValidationError('Data in invalid format');
  }

  data = {'dataset': temp, 'configuration': config};
  return data;
};

function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message;
}

ValidationError.prototype = Object.create(Error.prototype);

export default loadDatasetEpic;

export { loadDataset, CSVconvert };
