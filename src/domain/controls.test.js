import {
  default as controls,
  setHierarchy,
  showNodes,
  colorBy,
  selectControls
} from "./controls";
import { combineReducers } from "redux";

const reducer = combineReducers({ controls });

describe("Controls reducer", () => {
  describe("setHierarchy", () => {
    it("sets the hierarchy", () => {
      const hierarchy = [{ path: ["uid"], displayName: "UID" }];
      const action = setHierarchy(hierarchy);
      const result = reducer({}, action);

      expect(selectControls(result)).toEqual({
        hierarchy: hierarchy,
        showNodes: true,
        colorBy: null
      });
    });
  });

  describe("showNodes", () => {
    it("set showNodes to false", () => {
      const action = showNodes(false);
      const result = reducer({}, action);
      expect(selectControls(result).showNodes).toEqual(false);
    });

    it("set showNodes to true", () => {
      const action = showNodes(true);
      const result = reducer({}, action);
      expect(selectControls(result).showNodes).toEqual(true);
    });
  });

  describe("colorBy", () => {
    const field = { path: ["uid"], displayName: "UID" };
    const action = colorBy(field);
    const result = reducer({}, action);
    expect(selectControls(result).colorBy).toEqual(field);
  });
});
