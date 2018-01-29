import { combineReducers } from "redux";
import dataset from "./dataset";
import controls from "./controls";

export default combineReducers({
  dataset,
  controls
});
