import { ofType } from 'redux-observable';
import { isNil } from "ramda";
import { of } from "rxjs";
import { switchMap, map } from 'rxjs/operators';

import { setDatasetDiff } from "domain/dataset";

const getValue = require("get-value");

const DIFF_DATASET = "DIFF_DATASET";

const diffDataset = (payload) => ({'type': DIFF_DATASET, 'payload': payload })

const diffDatasetEpic = (action$, store) => {
  return action$.pipe(
      ofType(DIFF_DATASET)
      ,switchMap(({ payload }) => {
        return of(payload).pipe(
            map(generateDiff)
            ,map((payload) =>
              setDatasetDiff(payload)
            )
          );
      })
    );
};

const generateDiff = (payload) => {
  console.log("generateDiff payload %o", payload);
  const startDs = payload.start;
  const endDS = payload.end;
  const configuration = payload.configuration;
  const key = payload.key;
  const ignore = payload.ignore;
  let diffs = [];

  return diffs;
};

export default diffDatasetEpic;

export { diffDataset };