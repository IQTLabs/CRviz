import { createAction, handleActions } from "redux-actions";

const defaultState = {
  hierarchy: [], // Array of fields to group by.
  showNodes: true, // Whether to show individual nodes
  colorBy: null // The field for which to color the devices/groupings by.
};

// ACTIONS

const setHierarchy = createAction("SET_HIERARCHY");
const showNodes = createAction("SHOW_NODES");
const colorBy = createAction("COLOR_BY");

const reducer = handleActions(
  {
    [setHierarchy]: (state, { payload }) => ({ ...state, hierarchy: payload }),
    [showNodes]: (state, { payload }) => ({ ...state, showNodes: !!payload }), // Convert payload to boolean for easier debugging
    [colorBy]: (state, { payload }) => ({ ...state, colorBy: payload })
  },
  defaultState
);

const selectControls = (state) => state.controls;

export default reducer;
export { setHierarchy, showNodes, colorBy, selectControls };
