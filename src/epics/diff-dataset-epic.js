import { ofType } from 'redux-observable';
import { path } from "ramda";
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
        	map(applyHashes)
            ,map(generateDiff)
            ,map((payload) =>
              setDatasetDiff(payload)
            )
          );
      })
    );
};


const addHashKey = (keys, obj) => {
  const hashKey = keys.reduce( (h, k) => h + path(k.path, obj) + ":", "");
  obj["HASH_KEY"] = hashKey;
}

const addHashWithoutIgnored = (fields, obj) => {
  const hash = fields.reduce( (h, f) => h + path(f.path, obj) + "|", "");
  obj["HASH_WITHOUT_IGNORED"] = hash;
}

const applyHashes = (payload) => {
  const startDs = payload.start.dataset;
  const endDS = payload.end.dataset;
  const configuration = payload.configuration;
  const key = payload.key;
  const ignore = payload.ignore;
  const hashFields = configuration.fields.filter(f => !ignore.includes(f));

  if(startDs){
  	startDs.forEach((i) => {
  		if(key){
  			addHashKey(key, i);
  		}
  		addHashWithoutIgnored(hashFields, i);
  	});
  }

  if(endDS){
  	endDS.forEach((i) => {
  		if(key){
  			addHashKey(key, i);
  		}
  		addHashWithoutIgnored(hashFields, i);
  	});
  }
  return payload;
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
  diffs.added = diffs.added.concat(endDs.filter(ei => startDs.findIndex(si => si["HASH_KEY"] === ei["HASH_KEY"]) === -1).map(i => i["HASH_KEY"]));
  diffs.removed = diffs.removed.concat(startDs.filter(si => endDs.findIndex(ei => ei["HASH_KEY"] === si["HASH_KEY"]) === -1).map(i => i["HASH_KEY"]));

  diffs.changed = diffs.changed.concat(
  	endDs.filter(
  		ei => startDs.findIndex(
  			si => si["HASH_KEY"] === ei["HASH_KEY"] &&
  						si["HASH_WITHOUT_IGNORED"] !== ei["HASH_WITHOUT_IGNORED"]
  		) !== -1
  	).map(i => i["HASH_KEY"])
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