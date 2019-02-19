import { createAction, handleActions } from "redux-actions";

const defaultState = {
  hierarchyConfig: [], // Array of fields to group by.
  shouldShowNodes: true, // Whether to show individual nodes
  darkTheme: false, // Whether to use dark theme
  colorBy: null, // The field for which to color the devices/groupings by.
  start: null, // The uuid of the dataset to use as the starting point for comparison
  end: null // The uuid of the dataset to use as the end point for comparison
};

// ACTIONS

const setControls = createAction("SET_CONTROLS");
const setStartDataset = createAction("SET_START_DATASET");
const setEndDataset = createAction("SET_END_DATASET");
const setHierarchyConfig = createAction("SET_HIERARCHY_CONFIG");
const showNodes = createAction("SHOW_NODES");
const useDarkTheme = createAction("USE_DARK_THEME");
const colorBy = createAction("COLOR_BY");

const reducer = handleActions(
  {
    [setControls]: (state, { payload }) =>{
      const hierarchyConfig = payload.hierarchyConfig || defaultState.hierarchyConfig;
      const shouldShowNodes = ('shouldShowNodes' in payload) ? !!payload.shouldShowNodes : true;
      const darkTheme = ('darkTheme' in payload) ? !!payload.darkTheme : false;
      const colorBy = payload.colorBy || defaultState.colorBy
      const start = payload.start || defaultState.start
      const end = payload.end || defaultState.end
      return { 
        ...state,
        hierarchyConfig: hierarchyConfig,
        shouldShowNodes: shouldShowNodes,
        darkTheme: darkTheme,
        colorBy: colorBy,
        start: start,
        end: end
      }
    },
    [setStartDataset]: (state, { payload }) => {
      console.log("payload for setStartDataset: %o", payload)
      return { ...state, start: payload }
    },
    [setEndDataset]: (state, { payload }) => ({ ...state, end: payload }),
    [setHierarchyConfig]: (state, { payload }) => ({ ...state, hierarchyConfig: payload }),
    [showNodes]: (state, { payload }) => ({ ...state, shouldShowNodes: !!payload }), // Convert payload to boolean for easier debugging
    [useDarkTheme]: (state, { payload }) => ({ ...state, darkTheme: !!payload }), // Convert payload to boolean for easier debugging
    [colorBy]: (state, { payload }) => ({ ...state, colorBy: payload })
  },
  defaultState
);

const selectControls = (state) => state.controls;

export default reducer;
export { setControls, setHierarchyConfig, showNodes, colorBy, useDarkTheme, selectControls, setStartDataset, setEndDataset };
