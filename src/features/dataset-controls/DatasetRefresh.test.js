import React from 'react';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { expect } from "chai"
import sinon from 'sinon'

import DatasetRefresh from "./DatasetRefresh";
//import style from "./DatasetControls.module.css";

const onRefresh = () =>{ }
describe('DatasetRefresh', () => {
	it('renders the control', () => {
		const refresh = shallow(<DatasetRefresh
              //className={style.urlRefresh}
              onClick={onRefresh}
            />);
		expect(refresh.find('div.button')).to.have.length(1);
	});

	it('clicks the button', () => {
		const spy = sinon.spy();
		const refresh = shallow(<DatasetRefresh
              //className={style.urlRefresh}
              onClick={spy}
            />);
		refresh.find('div.button').simulate("click")
		expect(spy.calledOnce).to.equal(true);
	});

});