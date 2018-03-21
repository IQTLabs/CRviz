import { combineEpics } from 'redux-observable';
import fetchDatasetEpic from './fetch-dataset-epic';
import uploadDatasetEpic from './upload-dataset-epic';
import loadDatasetEpic from './load-dataset-epic';

const rootEpic = combineEpics(
  loadDatasetEpic,
  fetchDatasetEpic,
  uploadDatasetEpic
);

export default rootEpic;
