import { combineEpics } from 'redux-observable';
import fetchDatasetEpic from './fetch-dataset-epic';
import uploadDatasetEpic from './upload-dataset-epic';
import loadDatasetEpic from './load-dataset-epic';
import searchDatasetEpic from './search-dataset-epic';

const rootEpic = combineEpics(
  loadDatasetEpic,
  fetchDatasetEpic,
  uploadDatasetEpic,
  searchDatasetEpic
);

export default rootEpic;
