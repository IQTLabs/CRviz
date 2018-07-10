import React from 'react';
import { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { expect } from "chai"
import sinon from 'sinon'

import DatasetRefresh from "./DatasetRefresh";
import style from "./DatasetControls.module.css";

const onRefresh = () =>{ }
describe('DatasetRefresh', () => {
	it('renders the control', () => {
		const refresh = mount(<DatasetRefresh
              className={style.urlRefresh}
              onClick={onRefresh}
            />);
		expect(refresh.find('div.button')).to.have.length(1);
		expect(refresh.find('svg').first().prop('role')).to.equal('img');
		expect(refresh.find('svg').first().prop('data-icon')).to.equal('redo-alt');
	});

	it('clicks the button', () => {
		const spy = sinon.spy();
		const refresh = shallow(<DatasetRefresh
              className={style.urlRefresh}
              onClick={spy}
            />);
		refresh.find('div.button').simulate("click");
		expect(spy.calledOnce).to.equal(true);
	});

});