import { combineEpics } from 'redux-observable';
import fetchDatasetEpic from './fetch-dataset-epic';
import uploadDatasetEpic from './upload-dataset-epic';

const rootEpic = combineEpics(
  fetchDatasetEpic,
  uploadDatasetEpic
);

export default rootEpic;
