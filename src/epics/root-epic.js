import { combineEpics } from 'redux-observable';
import fetchDatasetEpic from './fetch-dataset-epic';
import uploadDatasetEpic from './upload-dataset-epic';
import loadDatasetEpic from './load-dataset-epic';
import searchDatasetEpic from './search-dataset-epic';
import indexDatasetEpic from './index-dataset-epic';
import refreshDatasetEpic from './refresh-dataset-epic';
import filterDatasetEpic from './filter-dataset-epic';

const rootEpic = combineEpics(
  loadDatasetEpic,
  fetchDatasetEpic,
  uploadDatasetEpic,
  searchDatasetEpic,
  indexDatasetEpic,
  refreshDatasetEpic,
  filterDatasetEpic,
  diffDatasetEpic
);

export default rootEpic;
