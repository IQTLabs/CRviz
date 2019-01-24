import { createAction, handleActions } from "redux-actions";

import { applyHashes, selectMergedConfiguration, setDataset } from "./dataset";

const getHashFields = (allFields, ignoredFields) => {
  if(!ignoredFields || ignoredFields.length === 0){
    return allFields;
  }
  
  return allFields.filter(f => !ignoredFields.includes(f));
}

const defaultState = {
  hierarchyConfig: [], // Array of fields to group by.
  shouldShowNodes: true, // Whether to show individual nodes
  darkTheme: false, // Whether to use dark theme
  colorBy: null, // The field for which to color the devices/groupings by.
  keyFields: [],
  ignoredFields: []
};

// ACTIONS

const setHierarchyConfig = createAction("SET_HIERARCHY_CONFIG");
const setKeyFields = createAction("SET_KEY_FIELDS");
const setIgnoredFields = createAction("SET_IGNORED_FIELDS");
const showNodes = createAction("SHOW_NODES");
const useDarkTheme = createAction("USE_DARK_THEME");
const colorBy = createAction("COLOR_BY");

const reducer = handleActions(
  {
    [setHierarchyConfig]: (state, { payload }) => ({ ...state, hierarchyConfig: payload }),
    [setKeyFields]: (state, { payload }) => { 
      const keyFields = payload;

      if(state.dataset && state.dataset.datasets){
        Object.keys(state.dataset.datasets).forEach((ds) => {
          ds.configuration.keyFields = keyFields
          applyHashes(ds.dataset, ds.configuration);
        });
      }

      return {...state, keyFields: keyFields };
    },
    [setIgnoredFields]: (state, { payload }) => {
      const ignoredFields = payload;

      if(state.dataset && state.dataset.datasets){
        const allFields = selectMergedConfiguration(state).fields;
        const hashFields = getHashFields(allFields, ignoredFields);

        Object.keys(state.dataset.datasets).forEach((ds) => {      
          ds.configuration.hashFields = hashFields
          applyHashes(ds.dataset, ds.configuration);
        });
      }

      return { ...state, ignoredFields: ignoredFields };
    },
    [showNodes]: (state, { payload }) => ({ ...state, shouldShowNodes: !!payload }), // Convert payload to boolean for easier debugging
    [useDarkTheme]: (state, { payload }) => ({ ...state, darkTheme: !!payload }), // Convert payload to boolean for easier debugging
    [colorBy]: (state, { payload }) => ({ ...state, colorBy: payload })
  },
  defaultState
);

const selectControls = (state) => state.controls;
const getKeyFields = (state) => state.controls && state.controls.keyFields ? state.controls.keyFields : [];
const getIgnoredFields = (state) => state.controls && state.controls.ignoredFields ? state.controls.ignoredFields : [];

export default reducer;
export { setHierarchyConfig, showNodes, colorBy, useDarkTheme, selectControls, setKeyFields, getKeyFields, setIgnoredFields, getIgnoredFields, getHashFields };
