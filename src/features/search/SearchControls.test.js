import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux'
import { createEpicMiddleware } from 'redux-observable';

import configureMockStore from 'redux-mock-store';
import { expect } from "chai"
import sinon from 'sinon'

import SearchControls from './SearchControls';
import style from "./SearchControls.module.css";

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

	// it('changes the selection', () => {
	// 	const fakeOnChange = (evt) =>{
			
	// 	}
	// 	const onChangeSpy = sinon.spy(fakeOnChange);
	// 	const selector = mount(<DatasetSelector
 //            className={style.selector}
 //            selected={empty}
 //            onChange={onChangeSpy}
 //            datasets={datasets}
 //          />);
	// 	selector.find('select').first().simulate('change', event);
	// 	expect(onChangeSpy.calledWith(datasets[2])).to.equal(true);
	// });

});