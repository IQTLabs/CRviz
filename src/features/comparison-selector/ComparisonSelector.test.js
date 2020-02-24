import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux'
import { createEpicMiddleware } from 'redux-observable';
import { v4 as uuidv4 } from 'uuid';

import configureMockStore from 'redux-mock-store';
import { expect } from "chai"

import { valuesFor } from "domain/dataset"

import ComparisonSelector from './ComparisonSelector';

const dataset = [
          { 'uid': "uid1", 'role': { 'role': "role", 'confidence': 80 } },
          { 'uid': "uid2", 'role': { 'role': "role", 'confidence': 80 } }
        ];

const configuration = {
  fields: [
    { 'path': ["uid"], 'displayName': "UID", groupable: true },
    { 'path': ["role", "role"], 'displayName': "Role", groupable: false }
  ]
};

const owner = uuidv4();

let initialState = {
  'dataset':{
    'datasets': {}
  },
  'controls':{
    'keyFields': [],
    'ignoredFields': [],
  },
};

describe('ComparisonSelector', () => {

    let store;

    beforeEach(() => {  
        const epicMiddleware = createEpicMiddleware();
        const mockStore = configureMockStore([epicMiddleware]);
        initialState.dataset.datasets = {};
        initialState.dataset.datasets[owner] = { 
        										 'dataset': dataset,
        										 'configuration': configuration, 
        										 'values': valuesFor(dataset, configuration) 
        									   }
        store  = mockStore(initialState);
    });

    afterEach(() => {
        
    });

    it('renders the control', (done) => {
        const wrapper = mount(
            <Provider store={store}>
                <ComparisonSelector />
            </Provider>
            );

        expect(wrapper.find('SelectedFieldList')).to.have.length(2);
        expect(wrapper.find('DropTarget')).to.have.length(2);
        expect(wrapper.find('AvailableFieldList')).to.have.length(1);

        done();
    });
});
