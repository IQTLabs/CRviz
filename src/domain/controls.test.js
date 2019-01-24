import { createEpicMiddleware } from 'redux-observable';
import configureMockStore from 'redux-mock-store';
import rootEpic from 'epics/root-epic'
import { 
  default as dataset,
  setDataset 
} from "./dataset";
import {
  default as controls,
  setHierarchyConfig,
  setKeyFields,
  getKeyFields,
  setIgnoredFields,
  getIgnoredFields,
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
        colorBy: null,
        keyFields: [],
        ignoredFields: []
      });

      done();
    });
  });

  describe("setKeyFields", () => {
    it("sets the fields to use as a key for comparison", (done) => {
      const keys = [{ path: ["uid"], displayName: "UID" }];
      const action = setKeyFields(keys);
      const owner = uuidv4();
      const ds = [
        { 'uid': "uid1", 'role': { 'role': "role", 'confidence': 80 } },
        { 'uid': "uid2", 'role': { 'role': "role", 'confidence': 80 } }
      ];
      const configuration = {
        fields: [
          { 'path': ["uid"], 'displayName': "UID", 'groupable': true },
          { 'path': ["role", "role"], 'displayName': "Role", 'groupable': false }
        ]
      };
      const dataset = {
        datasets:[]
      }
      dataset.datasets[owner] ={ 'dataset': ds, 'configuration': configuration }
      const result = reducer( {dataset: dataset}, action);

      expect(getKeyFields(result)).to.deep.equal(keys);

      done();
    });
  });

  describe("setIgnoreFields", () => {
    it("sets the fields to ignore in comparison", (done) => {
      const ignored = [{ path: ["timestamp"], displayName: "Timestamp" }];
      const action = setIgnoredFields(ignored);
      const result = reducer({}, action);

      expect(getIgnoredFields(result)).to.deep.equal(ignored);

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
