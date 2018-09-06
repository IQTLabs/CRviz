import {
  default as datasetReducer,
  setDataset,
  selectDataset,
  selectConfiguration,
  selectValues,
  setIsFetching,
  getIsFetching
} from "./dataset";

import { combineReducers } from "redux";
import { expect } from "chai"

import hash from "hash-it"

const reducer = combineReducers({ dataset: datasetReducer });

describe("Dataset Reducer", () => {
  describe("actions", () => {
    describe("setDataset", () => {
      it("sets the dataset and configuration", () => {
        const dataset = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];
        const configuration = {
          fields: [
            { path: ["uid"], displayName: "UID", groupable: true },
            { path: ["role", "role"], displayName: "Role", groupable: false }
          ]
        };

        const dsHash = hash(dataset);

        const action = setDataset({ hash: dsHash, dataset: dataset, configuration: configuration });
        const result = reducer({}, action);

        const expectedConfiguration = {
          fields: [
            { path: ["uid"], displayName: "UID", groupable: true },
            { path: ["role", "role"], displayName: "Role", groupable: false },
            {
              path: ["role", "confidence"],
              displayName: "role.confidence",
              groupable: true
            }
          ]
        };

        expect(selectDataset(result, dsHash)).to.deep.equal(dataset);
        expect(selectConfiguration(result, dsHash)).to.deep.equal(expectedConfiguration);
      });

      it("sets a default configuration", () => {
        const dataset = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];
        const dsHash = hash(dataset);

        const expectedConfiguration = {
          fields: [
            { path: ["uid"], displayName: "uid", groupable: true },
            {
              path: ["role", "role"],
              displayName: "role.role",
              groupable: true
            },
            {
              path: ["role", "confidence"],
              displayName: "role.confidence",
              groupable: true
            }
          ]
        };

        const action = setDataset({ hash: dsHash, dataset: dataset });
        const result = reducer({}, action);
        expect(selectConfiguration(result, dsHash)).to.deep.equal(expectedConfiguration);
      });

      it("find the unique values for each fields", () => {
        const dataset = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 82 } }
        ];
        const dsHash = hash(dataset);

        const expectedValues = {
          uid: ["uid1", "uid2"],
          "role.role": ["role"],
          "role.confidence": [80, 82]
        };

        const action = setDataset({ hash: dsHash, dataset: dataset });
        const result = reducer({}, action);
        expect(selectValues(result, dsHash)).to.deep.equal(expectedValues);
      });

      it("sets the fetching indicator", () => {
        const expectedValue = true;
        const data = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];
        const dsHash = hash(data);

        let dataset = { datasets: {} };
        dataset.datasets[dsHash] = {
          dataset: data,
          values: {},
          configuration: {
            fields: []
          },
          isFetching: false,
          lastUpdated: null
        }

        const action = setIsFetching({hash: dsHash, isFetching: true});
        const result = reducer({ dataset }, action);

        expect(getIsFetching(result, dsHash)).to.equal(expectedValue);
      });
    });
  });
});
