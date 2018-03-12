import {
  default as datasetReducer,
  setDataset,
  selectDataset,
  selectConfiguration
} from "./dataset";

import { combineReducers } from 'redux';

const reducer = combineReducers({ dataset: datasetReducer })

describe("Dataset", () => {
  describe("actions", () => {
    describe("setDataset", () => {
      it("sets the dataset and configuration", () => {
        const dataset = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];
        const configuration = {
          fields: [
            { path: ["uid"], displayName: "UID" },
            { path: ["role", "role"], displayName: "Role" }
          ]
        };

        const action = setDataset({ dataset, configuration })
        const result = reducer({}, action);

        expect(selectDataset(result)).toEqual(dataset)
        expect(selectConfiguration(result)).toEqual(configuration)
      });

      it('sets a default configuration', () => {
        const dataset = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];

        const action = setDataset({ dataset });
        const result = reducer({}, action);
        expect(selectConfiguration(result)).toEqual({
          fields: [
            { path: ['uid'], displayName: 'uid' },
            { path: ['role', 'role'], displayName: 'role.role' },
            { path: ['role', 'confidence'], displayName: 'role.confidence' },
          ]
        })
      })
    });
  });
});
