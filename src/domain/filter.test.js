import {
  default as filterReducer,
  setFilter,
  getFilter,
  clearFilter,
  filterIsValid
} from "./filter";

import { combineReducers } from "redux";
import { expect } from "chai"

import compileExpression from "filtrex";

const reducer = combineReducers({ filter: filterReducer });

describe("Filter Reducer", () => {
	describe("setFilter", () => {
	  it("sets a Filter", () => {
	    const filterString = "property > 1";

	    const action = setFilter(filterString);
	    const result = reducer({}, action);

	    const expectedIsValid = true;

	    expect(filterIsValid(result)).to.equal(expectedIsValid);
	    expect(getFilter(result)).to.not.equal(null);
	  });

	  it("clears the Filter", () => {
	    const filterString = "property > 1";
	    const filter = compileExpression(filterString);
	    const isValid = true

		const initialState = {
			filterString: filterString,
			filter: filter,
			isValid: isValid
		} 

	    const action = clearFilter();
	    const result = reducer({filter: initialState }, action);

	    expect(getFilter(result)).to.equal(null);
	    expect(filterIsValid(result)).to.equal(false);
	  });
	});
});