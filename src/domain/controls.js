import { createAction, handleActions } from "redux-actions";

const defaultState = {
  hierarchyConfig: [], // Array of fields to group by.
  shouldShowNodes: true, // Whether to show individual nodes
  darkTheme: false, // Whether to use dark theme
  colorBy: null, // The field for which to color the devices/groupings by.
  search: null
};

// ACTIONS

const setHierarchyConfig = createAction("SET_HIERARCHY_CONFIG");
const showNodes = createAction("SHOW_NODES");
const useDarkTheme = createAction("USE_DARK_THEME");
const colorBy = createAction("COLOR_BY");
const search = createAction("SEARCH");

const reducer = handleActions(
  {
    [setHierarchyConfig]: (state, { payload }) => ({ ...state, hierarchyConfig: payload }),
    [showNodes]: (state, { payload }) => ({ ...state, shouldShowNodes: !!payload }), // Convert payload to boolean for easier debugging
    [useDarkTheme]: (state, { payload }) => ({ ...state, darkTheme: !!payload }), // Convert payload to boolean for easier debugging
    [colorBy]: (state, { payload }) => ({ ...state, colorBy: payload }),
    [search]: (state, { payload }) => ({ ...state, search: payload })
  },
  defaultState
);

const selectControls = (state) => state.controls;

export default reducer;
export { setHierarchyConfig, showNodes, colorBy, useDarkTheme, search, selectControls };
