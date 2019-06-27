import { combineReducers } from "redux";
import { searchReducer as search } from 'epics/index-dataset-epic'
import dataset from "./dataset";
import controls from "./controls";
import error from "./error";
import filter from "./filter";
import notetaking from "./notetaking";

export default combineReducers({
  dataset,
  search,
  controls,
  error,
  filter,
  notetaking
});
