import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux'
import { createEpicMiddleware } from 'redux-observable';

import configureMockStore from 'redux-mock-store';
import { expect } from "chai"

import { valuesFor } from "domain/dataset"

import HierarchySelector from './HierarchySelector';
const uuidv4 = require('uuid/v4');

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
    'hierarchyConfig': []
  },
};

describe('HierarchySelector', () => {

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
                <HierarchySelector />
            </Provider>
            );

        expect(wrapper.find('SelectedFieldList')).to.have.length(1);
        expect(wrapper.find('DropTarget')).to.have.length(1);
        expect(wrapper.find('AvailableFieldList')).to.have.length(1);

        done();
    });
});
