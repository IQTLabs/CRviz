import { createAction, handleActions } from "redux-actions";
import compileExpression from "filtrex";

const defaultState = {
  filterString: "",
  filter: null,
  isValid: false
};

// ACTIONS
const setFilter = createAction("SET_FILTER");
const clearFilter = createAction("CLEAR_FILTER");

// REDUCERS
const reducer = handleActions(
  {
    [setFilter]: (state, { payload }) => {

	  	const filterString = payload;
	  	let filter = null;
	  	let isValid = false;
	  	try
	  	{
	  		filter = compileExpression(filterString);
	  		isValid = true;

	  	}
	  	catch(error)
	  	{
	  		filter = null;
	  		isValid = false;

	  	}
	  	return { ...state, filterString, filter, isValid };

    },
    [clearFilter]: (state) => {
     	const filterString = "";
	  	let filter = null;
	  	let isValid = false;
      return { ...state, filterString, filter, isValid };
    }
  },
  defaultState
);

// SELECTORS
const getFilter = (state) => state.filter.filter;
const filterIsValid = (state) => state.filter.isValid;

export default reducer;

export { setFilter, getFilter, clearFilter, filterIsValid};