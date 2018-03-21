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

  if (isNil(data.dataset) || !is(Array, data.dataset)) {
    errors.push(
      "Data must contains a key named dataset whose value is an array."
    );
  }

  if (!isEmpty(errors)) {
    throw new ValidationError(errors.join(" "));
  }
};

function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message;
}

ValidationError.prototype = Object.create(Error.prototype);

export default loadDatasetEpic;

export { loadDataset };
