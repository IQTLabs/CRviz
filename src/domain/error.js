import { createAction, handleActions } from "redux-actions";

const defaultState = {
  error: null
};

// ACTIONS
const setError = createAction("SET_ERROR");
const clearError = createAction("CLEAR_ERROR");

// REDUCERS
const reducer = handleActions(
  {
    [setError]: (state, { payload }) => {
      if( payload instanceof Error )
      {
      	const error = payload;
      	return { ...state, error };
      }
      return { ...state };
    },
    [clearError]: (state) => {
      const error = null;
      return { ...state, error };
    }
  },
  defaultState
);

// SELECTORS
const getError = (state) => state.error.error;


export default reducer;

export { setError, getError, clearError};
