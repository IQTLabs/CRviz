import { createAction, handleActions } from "redux-actions";

const defaultState = {
  hierarchyConfig: [], // Array of fields to group by.
  shouldShowNodes: true, // Whether to show individual nodes
  darkTheme: false, // Whether to use dark theme
  colorBy: null, // The field for which to color the devices/groupings by.
  start: null, // The uuid of the dataset to use as the starting point for comparison
  end: null, // The uuid of the dataset to use as the end point for comparison
  showBusy: false, //display the activity icon
  position: [0,0], // The position used for a mouse click
  datum: null //
};

// ACTION CREATORS

const setControls = createAction("SET_CONTROLS");
const setStartDataset = createAction("SET_START_DATASET");
const setEndDataset = createAction("SET_END_DATASET");
const setHierarchyConfig = createAction("SET_HIERARCHY_CONFIG");
const showNodes = createAction("SHOW_NODES");
const useDarkTheme = createAction("USE_DARK_THEME");
const colorBy = createAction("COLOR_BY");
const showBusy = createAction("SHOW_BUSY");
const setPosition = createAction("POSITION");
const setSelectedDatum = createAction("SETSELECTEDDATUM")

// REDUCERS

const reducer = handleActions(
  {
    [setControls]: (state, { payload }) =>{
      const hierarchyConfig = payload.hierarchyConfig || state.hierarchyConfig;
      const shouldShowNodes = ('shouldShowNodes' in payload) ? !!payload.shouldShowNodes : state.shouldShowNodes;
      const darkTheme = ('darkTheme' in payload) ? !!payload.darkTheme : state.darkTheme;
      const colorBy = payload.colorBy || state.colorBy;
      const start = payload.start || state.start;
      const end = payload.end || state.end;
      const showBusy = ('showBusy' in payload) ? !!payload.showBusy : state.showBusy;
      const position = payload.position || state.position;
      return { 
        ...state,
        hierarchyConfig: hierarchyConfig,
        shouldShowNodes: shouldShowNodes,
        darkTheme: darkTheme,
        colorBy: colorBy,
        start: start,
        end: end,
        showBusy: showBusy,
        position: position
      }
    },
    [setStartDataset]: (state, { payload }) => ({ ...state, start: payload }),
    [setEndDataset]: (state, { payload }) => ({ ...state, end: payload }),
    [setHierarchyConfig]: (state, { payload }) => ({ ...state, hierarchyConfig: payload }),
    [showNodes]: (state, { payload }) => ({ ...state, shouldShowNodes: !!payload }), // Convert payload to boolean for easier debugging
    [useDarkTheme]: (state, { payload }) => ({ ...state, darkTheme: !!payload }), // Convert payload to boolean for easier debugging
    [colorBy]: (state, { payload }) => ({ ...state, colorBy: payload }),
    [showBusy]: (state, { payload }) => ({ ...state, showBusy: !!payload }),
    [setPosition]: (state, { payload }) => ({ ...state, position: payload }),
    [setSelectedDatum]: (state, { payload }) => ({ ...state, selectedDatum: payload }),
  },
  defaultState
);

// SELECTORS
const selectControls = (state) => state.controls;
const getPosition = (state) => state.controls.position;
const getSelectedDatum = (state) => state.controls.selectedDatum;

export default reducer;
export { setControls, setHierarchyConfig, showNodes, colorBy, useDarkTheme, selectControls, setStartDataset, setEndDataset, showBusy, setPosition, getPosition, setSelectedDatum, getSelectedDatum };
