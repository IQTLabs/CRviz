import React from 'react';
import { shallow, mount } from 'enzyme';

import { expect } from "chai"
import sinon from 'sinon'

import DatasetTimedRefresh from "./DatasetTimedRefresh";
import style from "./DatasetControls.module.css";

describe('DatasetTimedRefresh', () => {
	it('renders the control with the timer stopped', () => {
		const spy = sinon.spy();
		const refresh = mount(<DatasetTimedRefresh
                className={style.urlRefresh}
                interval={10}
                timerIsRunning={false}
                onIntervalChange={spy}
                onStartClick={spy}
                onStopClick={spy}
              />);
		expect(refresh.find('div.button')).to.have.length(1);
		expect(refresh.find('svg').first().prop('role')).to.equal('img');
		expect(refresh.find('svg').first().prop('data-icon')).to.equal('sync-alt');
	});

	it('renders the control with the timer running', () => {
		const spy = sinon.spy();
		const refresh = mount(<DatasetTimedRefresh
                className={style.urlRefresh}
                interval={10}
                timerIsRunning={true}
                onIntervalChange={spy}
                onStartClick={spy}
                onStopClick={spy}
              />);
		expect(refresh.find('div.button')).to.have.length(1);
		expect(refresh.find('svg').first().prop('role')).to.equal('img');
		expect(refresh.find('svg').first().prop('data-icon')).to.equal('stop-circle');
	});

	it('clicks the start button', () => {
		const changeSpy = sinon.spy();
		const startSpy = sinon.spy();
		const stopSpy = sinon.spy();
		const refresh = shallow(<DatasetTimedRefresh
                className={style.urlRefresh}
                interval={10}
                timerIsRunning={false}
                onIntervalChange={changeSpy}
                onStartClick={startSpy}
                onStopClick={stopSpy}
              />);
		refresh.find('div.button').simulate("click");
		expect(startSpy.calledOnce).to.equal(true);
	});

	it('clicks the stop button', () => {
		const changeSpy = sinon.spy();
		const startSpy = sinon.spy();
		const stopSpy = sinon.spy();
		const refresh = shallow(<DatasetTimedRefresh
                className={style.urlRefresh}
                interval={10}
                timerIsRunning={true}
                onIntervalChange={changeSpy}
                onStartClick={startSpy}
                onStopClick={stopSpy}
              />);
		refresh.find('div.button').simulate("click");
		expect(stopSpy.calledOnce).to.equal(true);
	});

});