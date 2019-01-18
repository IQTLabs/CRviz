import {
  default as datasetReducer,
  setDataset,
  selectDataset,
  selectDatasets,
  removeDataset,
  setFilteredDataset,
  selectFilteredDataset,
  removeFilteredDataset,
  selectConfiguration,
  selectMergedConfiguration,
  selectValues,
  selectMergedValues,
  setIsFetching,
  getIsFetching,
  setDatasetDiff,
  removeDatasetDiff,
  selectDatasetDiff
} from "./dataset";

import { combineReducers } from "redux";
import { expect } from "chai"

const uuidv4 = require('uuid/v4');

const reducer = combineReducers({ dataset: datasetReducer });

describe("Dataset Reducer", () => {
  describe("actions", () => {
    describe("setDataset", () => {
      it("selects all datasets at once", (done) => {
        const owner1 = uuidv4();
        const owner2 = uuidv4();
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

        const action1 = setDataset({ 'owner': owner1, 'dataset': dataset, 'configuration': configuration });
        const action2 = setDataset({ 'owner': owner2, 'dataset': dataset, 'configuration': configuration });
        reducer({}, action1);
        const result2 = reducer({}, action2);

        const datasets = selectDatasets(result2);
        expect(Object.keys(datasets).length).to.equal(2);
        done();
      });
      
      it("sets the dataset and configuration", (done) => {
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

        done();
      });

      it("sets the filtered dataset", (done) => {
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

        done();
      });

      it("sets a default configuration", (done) => {
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

        done();
      });

      it("find the unique values for each fields", (done) => {
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

        done();
      });

      it("sets the fetching indicator", (done) => {
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
        done();
      });

      it("removes a dataset", (done) => {
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

        done();
      });

      it("removes a Filtered dataset", (done) => {
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

        done();
      });

      it("merges fields", (done) => {
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

        done();
      });

      it("merges values", (done) => {
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

        done();
      });
    });

    describe("setDatasetDiffs", () => {
      it("sets the diff between 2 datasets", (done) => {
        const ds1Owner = uuidv4();
        const ds2Owner = uuidv4();
        const differences =[{
          key:"uid2",
          fields: [{
            field: { 'path': ["role", "role"], 'displayName': "Role", 'groupable': false },
            startValue: "role1",
            endValue: "role2"
          }]
        }];     

        const action = setDatasetDiff({ 'start': ds1Owner, 'end': ds2Owner, 'differences': differences });
        const result = reducer({}, action);

        expect(selectDatasetDiff(result, ds1Owner, ds2Owner)).to.deep.equal(differences);

        done();
      });

      it("removes the diff between 2 datasets", (done) => {
        const ds1Owner = uuidv4();
        const ds2Owner = uuidv4();
        const differences =[{
          key:"uid2",
          fields: [{
            field: { 'path': ["role", "role"], 'displayName': "Role", 'groupable': false },
            startValue: "role1",
            endValue: "role2"
          }]
        }]; 

        const initialState = {
          dataset:{ 
            diffs:[
              { 'start': ds1Owner, 'end': ds2Owner, 'differences': differences }
            ]
          }
        };

        const action = removeDatasetDiff({ 'start': ds1Owner, 'end': ds2Owner});
        const result = reducer(initialState, action);

        expect(selectDatasetDiff(result, ds1Owner, ds2Owner)).to.equal(null);

        done();
      });
    });
  });
});
