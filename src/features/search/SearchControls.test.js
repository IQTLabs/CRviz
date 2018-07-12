import React from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux'
import { createEpicMiddleware } from 'redux-observable';

import configureMockStore from 'redux-mock-store';
import { expect } from "chai"

import SearchControls from './SearchControls';

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

const initialState = {
  dataset:{
  	dataset: dataset,
  	configuration: configuration
  },
  search:{
  	searchResults: [],
  	searchIndex: null,
  	queryString: '',
  },
};

describe('SearchControls', () => {

	let store;

	beforeEach(() => {	
		const epicMiddleware = createEpicMiddleware();
		const mockStore = configureMockStore([epicMiddleware]);
		store  = mockStore(initialState);
	});

	afterEach(() => {
		
	});

	it('renders the control', () => {
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
	});

	//i am deliberately overwriting the mocked store's dispatch method with my own method
	//so that i can recieve the dispatched actions to ensure that ui events properly 
	//emit the desired action
	it('accepts text input and clicks the search button', () => {
		const expectedAction = {
			type: 'SEARCH_DATASET',
			payload: {
				dataset: dataset,
  				configuration: configuration,
  				searchIndex: null,
				queryString: 'test',
  				results: []
			}
		}
		const event ={target: {value: "test"}}
		const fakeDispatch = (evt) =>{
			expect(evt).to.deep.equal(expectedAction);
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

	it('recieves a result set and displays the number of results and a clear button', () => {
		const expectedText = "2 Results found";
		const newState = {
		  queryString: 'uid',
		  searchIndex: null,
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
	});

	it('clears the search', () => {
		const newState = {
		  queryString: 'uid',
		  searchIndex: null,
		  results: dataset,
		  hasSearch: true
		}
		const expectedAction = {
			type: 'SEARCH_DATASET',
			payload: {
				dataset: dataset,
  				configuration: configuration,
  				searchIndex: null,
				queryString: '',
  				results: []
			}
		}
		const fakeDispatch = (evt) =>{
			expect(evt).to.deep.equal(expectedAction);
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