import {
  default as errorReducer,
  setError,
  getError,
  clearError
} from "./error";

import { combineReducers } from "redux";
import { expect } from "chai"

const reducer = combineReducers({ error: errorReducer });

describe("Error Reducer", () => {
	describe("setError", () => {
	  it("sets the Error", () => {
	    const message = "This is an Error";

	    const action = setError(new Error(message));
	    const result = reducer({}, action);

	    const expectedError = new Error(message);

	    expect(getError(result).message).to.equal(expectedError.message);
	  });

	  it("can not set a non error", () => {
	    const message = "This is an Error";

	    const action = setError(message);
	    const result = reducer({}, action);

	    expect(getError(result)).to.be.null;
	  });

	  it("clears the Error", () => {
	    const message = "This is an Error";
	    const error = new Error(message);

	    const action = clearError();
	    const result = reducer({error}, action);

	    expect(getError(result)).to.be.null;
	  });
	});
});