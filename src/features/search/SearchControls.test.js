import React from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux'
import { createEpicMiddleware } from 'redux-observable';

import configureMockStore from 'redux-mock-store';
import { expect } from "chai"

import SearchControls from './SearchControls';
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
  'search':{
  	'searchResults': [],
  	'searchIndices': [],
  	'queryString': '',
  },
};

describe('SearchControls', () => {

	let store;

	beforeEach(() => {	
		const epicMiddleware = createEpicMiddleware();
		const mockStore = configureMockStore([epicMiddleware]);
		initialState.dataset.datasets = {};
		initialState.dataset.datasets[owner] = { 'dataset': dataset, 'configuration': configuration }
		store  = mockStore(initialState);
	});

	afterEach(() => {
		
	});

	it('renders the control', (done) => {
		const wrapper = mount(
			<Provider store={store}>
				<SearchControls />
			</Provider>
			);
		expect(wrapper.find('input#search-string')).to.have.length(1);
		expect(wrapper.find('input#search-string').first().prop("placeholder")).to.equal("Search");
		expect(wrapper.find('input#search-string').first().prop("type")).to.equal("search");
		expect(wrapper.find('svg').first().prop('role')).to.equal('img');
		expect(wrapper.find('svg').first().prop('data-icon')).to.equal('search');

		done();
	});

	//i am deliberately overwriting the mocked store's dispatch method with my own method
	//so that i can recieve the dispatched actions to ensure that ui events properly 
	//emit the desired action
	it('accepts text input and clicks the search button', (done) => {
		const expectedAction = {
			type: 'SEARCH_DATASET',
			payload: {
				'dataset': dataset,
  				'configuration': configuration,
  				'searchIndices': [],
				'queryString': 'test',
  				'results': []
			}
		}
		const event ={target: {value: "test"}}
		const fakeDispatch = (evt) =>{
			expect(evt).to.deep.equal(expectedAction);
			done();
		}
		store.dispatch = fakeDispatch;
		const wrapper = mount(
			<Provider store={store}>
				<SearchControls />
			</Provider>
			);
		expect(wrapper.find('input#search-string')).to.have.length(1);
		wrapper.find('input#search-string').first().simulate('change', event);
		wrapper.find('label.button').first().simulate('click');
	});

	it('recieves a result set and displays the number of results and a clear button', (done) => {
		const expectedText = "2 Results found";
		const newState = {
		  queryString: 'uid',
		  searchIndices: [],
		  results: dataset,
		  hasSearch: true
		}
		const wrapper = shallow( <SearchControls />, {
			context: {
		        store: store
		      },
		});
		const newWrap = wrapper.dive().setState(newState).setProps({results: dataset}).render();
		expect(newWrap.find('label#search-results').text().trim()).to.equal(expectedText);
		expect(newWrap.find('svg')).to.have.length(2);
		expect(newWrap.find('svg').last().prop('role')).to.equal('img');
		expect(newWrap.find('svg').last().prop('data-icon')).to.equal('times-circle');

		done();
	});

	it('clears the search', (done) => {
		const newState = {
		  queryString: 'uid',
		  searchIndices: [],
		  results: dataset,
		  hasSearch: true
		}
		const expectedAction = {
			type: 'SEARCH_DATASET',
			payload: {
				dataset: dataset,
  				configuration: configuration,
  				searchIndices: [],
				queryString: '',
  				results: []
			}
		}
		const fakeDispatch = (evt) =>{
			expect(evt).to.deep.equal(expectedAction);
			done();
		}
		store.dispatch = fakeDispatch;
		const wrapper = shallow( <SearchControls />, {
			context: {
		        store: store
		      },
		});
		const newWrap = wrapper.dive().setState(newState).setProps({results: dataset});
		expect(newWrap.state().queryString).not.to.equal(expectedAction.payload.queryString);
		newWrap.find('label.button').last().simulate('click');
	});

});