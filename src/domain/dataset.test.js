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

        const action = setDataset({ dataset, configuration });
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

        expect(selectDataset(result)).to.deep.equal(dataset);
        expect(selectConfiguration(result)).to.deep.equal(expectedConfiguration);
      });

      it("sets a default configuration", () => {
        const dataset = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];

        const action = setDataset({ dataset });
        const result = reducer({}, action);
        expect(selectConfiguration(result)).to.deep.equal({
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
        });
      });

      it("find the unique values for each fields", () => {
        const dataset = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 82 } }
        ];

        const action = setDataset({ dataset });
        const result = reducer({}, action);
        expect(selectValues(result)).to.deep.equal({
          uid: ["uid1", "uid2"],
          "role.role": ["role"],
          "role.confidence": [80, 82]
        });
      });

      it("sets the fetching indicator", () => {
        const expectedValue = true;
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

        const action = setIsFetching({ dataset, configuration });
        const result = reducer({ dataset, configuration }, action);

        expect(getIsFetching(result)).to.equal(expectedValue);
      });
    });
  });
});
