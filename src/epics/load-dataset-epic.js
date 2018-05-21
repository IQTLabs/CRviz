import { createAction } from "redux-actions";
import { Observable } from "rxjs";

import { isNil, is } from "ramda";

import { setDataset } from "domain/dataset";
import { setHierarchyConfig, colorBy } from "domain/controls";

const loadDataset = createAction("LOAD_DATASET");

const loadDatasetEpic = (action$, store) => {
  return action$
    .ofType(loadDataset.toString())
    .mergeMap(({ payload }) => {
      return Observable.of(payload)
        .do(formatPayload)
        .map((payload) =>
          setDataset({
            dataset: payload.dataset,
            configuration: payload.configuration
          })
        )
        .concat(Observable.of(setHierarchyConfig([]), colorBy(null)))
        .catch((error) => {
          if (is(ValidationError, error)) {
            alert(error.message);
            return Observable.empty();
          } else {
            throw error;
          }
        });
    });
};

// doesn't really care if it's not CSV; if it *is* CSV, convert to JSON.
// Otherwise, just pass it along.
const CSVconvert = (data) => {
  var lines = data.trim().split(/[\r\n]+/g);
  if (lines[0].length < 2) { // bail if there's not even linebreaks
    return data;
  }
  var jsonstring = '['
  var colnames = lines[0].replace(/[;|\t]/g, ",").split(",")
  for (var i=1; i < lines.length; i++) {
    var entry = lines[i].replace(/[;|\t]/g, ",").split(",")
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
  var temp = {};
  if(isNil(data.dataset)) {
    if(is(Array, data)) {
      temp.dataset = data;
    } else {
      temp.dataset = Object.keys(data).map( (key) =>{ return [key, data[key]] })
    }
  } else if(is(Array, data.dataset)) {
    temp.dataset = data.dataset;
  }

  data.dataset = temp.dataset;
};

function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message;
}

ValidationError.prototype = Object.create(Error.prototype);

export default loadDatasetEpic;

export { loadDataset, CSVconvert };
