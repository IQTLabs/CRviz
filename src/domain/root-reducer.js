import { combineReducers } from "redux";
import { index } from 'epics/index-dataset-epic'
import dataset from "./dataset";
import controls from "./controls";

export default combineReducers({
  dataset,
  index,
  controls
});
