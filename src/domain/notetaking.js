import { createAction, handleActions } from "redux-actions";

const defaultState = {
  noteString: "",
};

// ACTIONS
const setNote = createAction("SET_NOTE");
const clearNote = createAction("CLEAR_NOTE");

// REDUCERS
const reducer = handleActions(
  {
    [setNote]: (state, { payload }) => {

	  	const noteString = payload;
	  	return { ...state, noteString };

    },
    [clearNote]: (state) => {
     	const noteString = "";
      return { ...state, noteString };
    }
  },
  defaultState
);

// SELECTORS
const getNote = (state) => state.notetaking.noteString;

export default reducer;

export { setNote, clearNote, getNote};