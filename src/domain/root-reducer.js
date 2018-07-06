import { combineReducers } from "redux";
import { searchReducer as search } from '../epics/index-dataset-epic'
import dataset from "./dataset";
import controls from "./controls";

export default combineReducers({
  dataset,
  search,
  controls
});
