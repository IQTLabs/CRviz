import {
  default as datasetReducer,
  setDataset,
  selectDataset,
  removeDataset,
  setFilteredDataset,
  selectFilteredDataset,
  removeFilteredDataset,
  selectConfiguration,
  selectMergedConfiguration,
  selectValues,
  selectMergedValues,
  setIsFetching,
  getIsFetching
} from "./dataset";

import { combineReducers } from "redux";
import { expect } from "chai"

const uuidv4 = require('uuid/v4');

const reducer = combineReducers({ dataset: datasetReducer });

describe("Dataset Reducer", () => {
  describe("actions", () => {
    describe("setDataset", () => {
      it("sets the dataset and configuration", () => {
        const owner = uuidv4();
        const dataset = [
          { 'uid': "uid1", 'role': { 'role': "role", 'confidence': 80 } },
          { 'uid': "uid2", 'role': { 'role': "role", 'confidence': 80 } }
        ];
        const configuration = {
          fields: [
            { 'path': ["uid"], 'displayName': "UID", 'groupable': true },
            { 'path': ["role", "role"], 'displayName': "Role", 'groupable': false }
          ]
        };

        const action = setDataset({ 'owner': owner, 'dataset': dataset, 'configuration': configuration });
        const result = reducer({}, action);

        const expectedConfiguration = {
          fields: [
            { 'path': ["uid"], 'displayName': "UID", 'groupable': true },
            { 'path': ["role", "role"], 'displayName': "Role", 'groupable': false },
            {
              'path': ["role", "confidence"],
              'displayName': "role.confidence",
              'groupable': true
            }
          ]
        };

        expect(selectDataset(result, owner)).to.deep.equal(dataset);
        expect(selectConfiguration(result, owner)).to.deep.equal(expectedConfiguration);
      });

      it("sets the filtered dataset", () => {
        const owner = uuidv4();
        const data = [
          { 'uid': "uid1", 'role': { 'role': "role", 'confidence': 80 } },
          { 'uid': "uid2", 'role': { 'role': "role", 'confidence': 80 } }
        ];
        const filtered = [
          { 'uid': "uid1", 'role': { 'role': "role", 'confidence': 80 } }
          ]
        const configuration = {
          fields: [
            { 'path': ["uid"], 'displayName': "UID", 'groupable': true },
            { 'path': ["role", "role"], 'displayName': "Role", 'groupable': false }
          ]
        };
        let dataset = {
          'datasets': {}
        }

        dataset.datasets[owner] = {
          'dataset': data,
          'filtered': null,
          'configuration': configuration
        }

        const action = setFilteredDataset({ 'owner': owner, 'filtered': filtered });
        const result = reducer({dataset}, action);

        expect(selectFilteredDataset(result, owner)).to.deep.equal(filtered);
      });

      it("sets a default configuration", () => {
        const owner = uuidv4();
        const dataset = [
          { 'uid': "uid1", 'role': { 'role': "role", 'confidence': 80 } },
          { 'uid': "uid2", 'role': { 'role': "role", 'confidence': 80 } }
        ];

        const expectedConfiguration = {
          fields: [
            { 'path': ["uid"], 'displayName': "uid", 'groupable': true },
            {
              'path': ["role", "role"],
              'displayName': "role.role",
              'groupable': true
            },
            {
              'path': ["role", "confidence"],
              'displayName': "role.confidence",
              'groupable': true
            }
          ]
        };

        const action = setDataset({ 'owner': owner, 'dataset': dataset });
        const result = reducer({}, action);
        expect(selectConfiguration(result, owner)).to.deep.equal(expectedConfiguration);
      });

      it("find the unique values for each fields", () => {
        const owner = uuidv4();
        const dataset = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 82 } }
        ];

        const expectedValues = {
          uid: ["uid1", "uid2"],
          "role.role": ["role"],
          "role.confidence": [80, 82]
        };

        const action = setDataset({ 'owner': owner, 'dataset': dataset });
        const result = reducer({}, action);
        expect(selectValues(result, owner)).to.deep.equal(expectedValues);
      });

      it("sets the fetching indicator", () => {
        const owner = uuidv4();
        const expectedValue = true;
        const data = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];

        let dataset = { datasets: {} };
        dataset.datasets[owner] = {
          dataset: data,
          values: {},
          configuration: {
            fields: []
          },
          isFetching: false,
          lastUpdated: null
        }

        const action = setIsFetching({'owner': owner, 'isFetching': true});
        const result = reducer({ dataset }, action);

        expect(getIsFetching(result, owner)).to.equal(expectedValue);
      });

      it("removes a dataset", () => {
        const owner = uuidv4();
        const data = [
          { 'uid': "uid1", 'role': { 'role': "role", 'confidence': 80 } },
          { 'uid': "uid2", 'role': { 'role': "role", 'confidence': 80 } }
        ];
        const configuration = {
          fields: [
            { 'path': ["uid"], 'displayName': "UID", 'groupable': true },
            { 'path': ["role", "role"], 'displayName': "Role", 'groupable': false }
          ]
        };
        let dataset = {
          'datasets': {}
        }

        dataset.datasets[owner] = {
          'dataset': data,
          'configuration': configuration
        }

        const action = removeDataset({ 'owner': owner });
        const result = reducer({dataset}, action);

        expect(selectDataset(result, owner).length).to.equal(0);
        expect(selectConfiguration(result, owner).fields.length).to.equal(0);
      });

      it("removes a Filtered dataset", () => {
        const owner = uuidv4();
        const data = [
          { 'uid': "uid1", 'role': { 'role': "role", 'confidence': 80 } },
          { 'uid': "uid2", 'role': { 'role': "role", 'confidence': 80 } }
        ];
        const filtered = [
          { 'uid': "uid1", 'role': { 'role': "role", 'confidence': 80 } }
          ]
        const configuration = {
          fields: [
            { 'path': ["uid"], 'displayName': "UID", 'groupable': true },
            { 'path': ["role", "role"], 'displayName': "Role", 'groupable': false }
          ]
        };
        let dataset = {
          'datasets': {}
        }

        dataset.datasets[owner] = {
          'dataset': data,
          'filtered': filtered,
          'configuration': configuration
        }

        const action = removeFilteredDataset({ 'owner': owner });
        const result = reducer({dataset}, action);

        expect(selectDataset(result, owner)).to.deep.equal(data);
        expect(selectFilteredDataset(result, owner)).to.equal(null);
      });

      it("merges fields", () => {
        const initialState = {
          'dataset': {
            'datasets': {
              'test1': {
                'dataset': {},
                'configuration':{
                  'fields': [
                    { 'path': ["id"], 'displayName': "id", 'groupable': true },
                    { 'path': ["name"], 'displayName': "name", 'groupable': true },
                  ]
                }
              },
              'test2': {
                'dataset': {},
                'configuration': {
                  'fields': [
                    { 'path': ["id"], 'displayName': "id", 'groupable': true },
                    { 'path': ["value"], 'displayName': "value", 'groupable': true },
                  ]
                }
              }
            }
          }
        };

        const expectedConfig ={
          'fields': [
              { 'path': ["id"], 'displayName': "id", 'groupable': true },
              { 'path': ["name"], 'displayName': "name", 'groupable': true },
              { 'path': ["value"], 'displayName': "value", 'groupable': true },
          ]
        }
        expect(selectMergedConfiguration(initialState)).to.deep.equal(expectedConfig);
      });

      it("merges values", () => {
        const initialState = {
          'dataset': {
            'datasets': {
              'test1': {
                'dataset': {},
                'configuration':{
                  'fields': [
                    { 'path': ["id"], 'displayName': "id", 'groupable': true },
                    { 'path': ["name"], 'displayName': "name", 'groupable': true },
                  ]
                },
                'values': {
                  'id': [1, 2, 3],
                  'name': ["test1", "test2", "test3"]
                }
              },
              'test2': {
                'dataset': {},
                'configuration': {
                  'fields': [
                    { 'path': ["id"], 'displayName': "id", 'groupable': true },
                    { 'path': ["value"], 'displayName': "value", 'groupable': true },
                  ]
                },
                'values': {
                  'id': [1, 2, 4, 5],
                  'value': ["test1", "test2", "test4", "test5"]
                }
              }
            }
          }
        };

        const expectedValues ={
          'id': [1, 2, 3, 4, 5],
          'name': ["test1", "test2", "test3"],
          'value': ["test1", "test2", "test4", "test5"]
        }
        expect(selectMergedValues(initialState)).to.deep.equal(expectedValues);
      });
    });
  });
});
