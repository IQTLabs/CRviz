import { createAction, handleActions } from "redux-actions";

const defaultState = {
  hierarchy: [], // Array of fields to group by.
  shouldShowNodes: true, // Whether to show individual nodes
  darkTheme: false, // Whether to use dark theme
  colorBy: null, // The field for which to color the devices/groupings by.
};

// ACTIONS

const setHierarchy = createAction("SET_HIERARCHY");
const addToHierarchy = createAction("ADD_TO_HIERARCHY");
const showNodes = createAction("SHOW_NODES");
const useDarkTheme = createAction("USE_DARK_THEME");
const colorBy = createAction("COLOR_BY");

const reducer = handleActions(
  {
    [setHierarchy]: (state, { payload }) => ({ ...state, hierarchy: payload }),
    [showNodes]: (state, { payload }) => ({ ...state, shouldShowNodes: !!payload }), // Convert payload to boolean for easier debugging
    [useDarkTheme]: (state, { payload }) => ({ ...state, darkTheme: !!payload }), // Convert payload to boolean for easier debugging
    [colorBy]: (state, { payload }) => ({ ...state, colorBy: payload })
  },
  defaultState
);

const selectControls = (state) => state.controls;

export default reducer;
export { setHierarchy, addToHierarchy, showNodes, colorBy, useDarkTheme, selectControls };
