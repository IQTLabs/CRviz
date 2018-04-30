import { createAction } from "redux-actions";
import { Observable } from "rxjs";

import { isNil} from "ramda";

import { setSearchResults } from "domain/dataset";
import { setHierarchyConfig, colorBy } from "domain/controls";

const searchDataset = createAction("SEARCH_DATASET");

const searchDatasetEpic = (action$, store) => {
  return action$
    .ofType(searchDataset.toString())
    .mergeMap(({ payload }) => {
      return Observable.of(payload)
        .do(performSearch)
        .map((payload) =>
          setSearchResults({
            results: payload.results
          })
        )
        .concat(Observable.of(setHierarchyConfig([]), colorBy(null)))
    });
};

const performSearch = (data) => {
  console.log("i'm searching here");
  console.log(data);
  data.results = data.dataset[0];
  console.log(data.results);
};

export default searchDatasetEpic;

export { searchDataset };
