import { ofType } from 'redux-observable';
import { isNil } from "ramda";
import { of } from "rxjs";
import { mergeMap, map } from 'rxjs/operators';

import { configurationFor } from "domain/dataset";

const getValue = require("get-value");
const lunr = require("lunr");

const BUILD_DIFF = "BUILD_DIFF";
const BUILD_DIFF_SUCCESS = "BUILD_DIFF_SUCCESS";
const REMOVE_DIFF = "REMOVE_DIFF";

const buildDiff = (payload) => ({'type': BUILD_DIFF, 'payload': payload })
const buildDiffSuccess = (payload) => ({'type': BUILD_DIFF_SUCCESS, 'payload': payload})

const diffDatasetEpic = (action$, store) => {
  return action$.pipe(
      ofType(BUILD_DIFF)
      ,switchMap(({ payload }) => {
        return of(payload).pipe(
            map(generateDiff)
            ,map((payload) =>
              buildIndexSuccess(payload)
            )
          );
      })
    );
};

const generateDiff = (payload) => {
  const startDs = payload.start;
  const endDS = payload.end;
  const configuration = payload.configuration || configurationFor(dataset);
  const key = payload.key;
  const ignore = payload.ignore;
  let diffs = [];

  return diffs;
};

export default diffDatasetEpic;

export { diffDataset };