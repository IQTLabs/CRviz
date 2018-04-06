import { createAction } from "redux-actions";
import { Observable } from "rxjs";

import { isNil, is, isEmpty } from "ramda";

import { setDataset } from "domain/dataset";
import { setHierarchyConfig, colorBy } from "domain/controls";

const loadDataset = createAction("LOAD_DATASET");

const loadDatasetEpic = (action$, store) => {
  return action$
    .ofType(loadDataset.toString())
    .mergeMap(({ payload }) => {
      return Observable.of(payload)
        .do(validate)
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

const validate = (data) => {
  const errors = [];

  //in the case of a naked array the array will be implicitly placed into a suboject named dataset
  //hence the check on data.data
  console.log(data);
  if ((isNil(data.dataset) || !is(Array, data.dataset)) && !is(Array, data.data)) {
    errors.push(
      "Data must contain a key named dataset whose value is an array or be an array itself."
    );
  }

  if (!isEmpty(errors)) {
    throw new ValidationError(errors.join(" "));
  }
};

//if we have a naked array instead of an object containing a dataset
//transfer the array into an object's dataset to maintain a consistent
//schema with what is used elsewhere see https://github.com/CyberReboot/CRviz/issues/33
const formatPayload = (data) => {
  var tempDataset = [];
  if(isNil(data.dataset) && is(Array, data.data)){
    tempDataset = data.data;
  } else {
    tempDataset = data.dataset;
  }
  data.dataset = tempDataset;
};

function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message;
}

ValidationError.prototype = Object.create(Error.prototype);

export default loadDatasetEpic;

export { loadDataset };
