import React from 'react';
import { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { expect } from "chai"
import sinon from 'sinon'

import DatasetSelector from "./DatasetSelector";
import style from "./DatasetControls.module.css";

const datasets =[
	{"name": "ds1", "url":"test1.url"},
	{"name": "ds2", "url":"test2.url"},
	{"name": "ds3", "url":"test3.url"}
]
const empty = {name: "None", url:" "};
const change = (target) => {

}
const event = {"target": {"name": "ds3", "url":"test3.url"}};
describe('DatasetSelector', () => {
	it('renders the control', () => {
		const selector = mount(<DatasetSelector
            className={style.selector}
            selected={empty}
            onChange={change}
            datasets={datasets}
          />);
		//4 items because of the implicit "None we add"
		expect(selector.find('option')).to.have.length(4);
	});

	it('changes the selection', () => {
		const onChange = sinon.stub()
		const selector = mount(<DatasetSelector
            className={style.selector}
            selected={empty}
            onChange={onChange}
            datasets={datasets}
          />);
		selector.find('select').first().simulate("change", event);
		expect(onChange.calledOnce).to.equal(true);
	});

});