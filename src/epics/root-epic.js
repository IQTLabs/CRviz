import { combineEpics } from 'redux-observable';
import fetchDatasetEpic from './fetch-dataset-epic';

const rootEpic = combineEpics(
  fetchDatasetEpic
);

export default rootEpic;
