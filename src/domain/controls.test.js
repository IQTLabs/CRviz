import {
  default as controls,
  setHierarchyConfig,
  showNodes,
  useDarkTheme,
  colorBy,
  selectControls
} from "./controls";
import { combineReducers } from "redux";

const reducer = combineReducers({ controls });

describe("Controls reducer", () => {
  describe("setHierarchyConfig", () => {
    it("sets the hierarchy config", () => {
      const hierarchyConfig = [{ path: ["uid"], displayName: "UID" }];
      const action = setHierarchyConfig(hierarchyConfig);
      const result = reducer({}, action);

      expect(selectControls(result)).toEqual({
        hierarchyConfig: hierarchyConfig,
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
