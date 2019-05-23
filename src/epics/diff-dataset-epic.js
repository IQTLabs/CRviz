import { ofType } from 'redux-observable';
import { of } from "rxjs";
import { switchMap, map } from 'rxjs/operators';

import { setDatasetDiff } from "domain/dataset";

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
  const startOwner = payload.start.owner;
  const startDs = payload.start.dataset;
  const endOwner = payload.end.owner;
  const endDs = payload.end.dataset;

  let diffs = {
  	added: [],
  	changed:[],
  	removed:[]
  };
  diffs.added = diffs.added.concat(endDs.filter(ei => startDs.findIndex(si => si.CRVIZ["_HASH_KEY"] === ei.CRVIZ["_HASH_KEY"]) === -1).map(i => i.CRVIZ["_HASH_KEY"]));
  diffs.removed = diffs.removed.concat(startDs.filter(si => endDs.findIndex(ei => ei.CRVIZ["_HASH_KEY"] === si.CRVIZ["_HASH_KEY"]) === -1).map(i => i.CRVIZ["_HASH_KEY"]));

  diffs.changed = diffs.changed.concat(
  	endDs.filter(
  		ei => startDs.findIndex(
  			si => si.CRVIZ["_HASH_KEY"] === ei.CRVIZ["_HASH_KEY"] &&
  						si.CRVIZ["_HASH_WITHOUT_IGNORED"] !== ei.CRVIZ["_HASH_WITHOUT_IGNORED"]
  		) !== -1
  	).map(i => i.CRVIZ["_HASH_KEY"])
  );

  //console.log("diffs to return: %o", diffs);
  const result = {
  	'start': startOwner,
  	'end': endOwner,
  	'differences': diffs
  }
  return result;
};

export default diffDatasetEpic;

export { diffDataset };