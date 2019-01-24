import { 
  default as dataset
} from "./dataset";
import {
  default as controls,
  setHierarchyConfig,
  showNodes,
  useDarkTheme,
  colorBy,
  selectControls
} from "./controls";
import { combineReducers } from "redux";
import { expect } from "chai"

const uuidv4 = require('uuid/v4');
const reducer = combineReducers({ dataset, controls });

describe("Controls reducer", () => {
  

  describe("setHierarchyConfig", () => {
    it("sets the hierarchy config", (done) => {
      const hierarchyConfig = [{ path: ["uid"], displayName: "UID" }];
      const action = setHierarchyConfig(hierarchyConfig);
      const result = reducer({}, action);

      expect(selectControls(result)).to.deep.equal({
        hierarchyConfig: hierarchyConfig,
        shouldShowNodes: true,
        darkTheme: false,
        colorBy: null
      });

      done();
    });
  });

  describe("showNodes", () => {
    it("set showNodes to false", (done) => {
      const action = showNodes(false);
      const result = reducer({}, action);
      expect(selectControls(result).shouldShowNodes).to.equal(false);

      done();
    });

    it("set showNodes to true", (done) => {
      const action = showNodes(true);
      const result = reducer({}, action);
      expect(selectControls(result).shouldShowNodes).to.equal(true);

      done();
    });
  });

  describe("useDarkTheme", () => {
    it("set useDarkTheme to false", (done) => {
      const action = useDarkTheme(false);
      const result = reducer({}, action);
      expect(selectControls(result).darkTheme).to.equal(false);

      done();
    });

    it("set useDarkTheme to true", (done) => {
      const action = useDarkTheme(true);
      const result = reducer({}, action);
      expect(selectControls(result).darkTheme).to.equal(true);

      done();
    });
  });

  describe("colorBy", () => {
    const field = { path: ["uid"], displayName: "UID" };
    const action = colorBy(field);
    const result = reducer({}, action);
    expect(selectControls(result).colorBy).to.equal(field);

  });
});
