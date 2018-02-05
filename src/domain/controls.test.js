import {
  default as controls,
  setHierarchy,
  showNodes,
  useDarkTheme,
  colorBy,
  selectControls
} from "./controls";
import { combineReducers } from "redux";

import { concat, reduce } from "ramda";

const reducer = combineReducers({ controls });

describe("Controls reducer", () => {
  describe("setHierarchy", () => {
    it("sets the hierarchy", () => {
      const hierarchy = [{ path: ["uid"], displayName: "UID" }];
      const action = setHierarchy(hierarchy);
      const result = reducer({}, action);

      expect(selectControls(result)).toEqual({
        hierarchy: hierarchy,
        shouldShowNodes: true,
        darkTheme: false,
        colorBy: null
      });
    });
  });

  describe("showNodes", () => {
    it("set showNodes to false", () => {
      const action = showNodes(false);
      const result = reducer({}, action);
      expect(selectControls(result).shouldShowNodes).toEqual(false);
    });

    it("set showNodes to true", () => {
      const action = showNodes(true);
      const result = reducer({}, action);
      expect(selectControls(result).shouldShowNodes).toEqual(true);
    });
  });

  describe("useDarkTheme", () => {
    it("set useDarkTheme to false", () => {
      const action = useDarkTheme(false);
      const result = reducer({}, action);
      expect(selectControls(result).darkTheme).toEqual(false);
    });

    it("set useDarkTheme to true", () => {
      const action = useDarkTheme(true);
      const result = reducer({}, action);
      expect(selectControls(result).darkTheme).toEqual(true);
    });
  });

  describe("colorBy", () => {
    const field = { path: ["uid"], displayName: "UID" };
    const action = colorBy(field);
    const result = reducer({}, action);
    expect(selectControls(result).colorBy).toEqual(field);
  });
});
