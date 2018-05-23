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
        .map(formatPayload)
        .map((payload) => {
          return setDataset({
            dataset: payload.dataset,
            configuration: payload.configuration
          })}
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

export { loadDataset };
