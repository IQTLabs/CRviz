import React from 'react';
import { shallow, mount } from 'enzyme';

import { expect } from "chai"
import sinon from 'sinon'

import DatasetDownload from "./DatasetDownload";
import style from "./DatasetControls.module.css";

describe('DatasetDownload', () => {
	const name = "fakeName";
	const expectedName = name + ".json"
	const url = "test.url";
	it('renders the control', () => {
		const refresh = mount(<DatasetDownload
              className={style.fileDownload}
              selected={name}
              url={url}
            />);
		expect(refresh.find('a.button')).to.have.length(1);
		expect(refresh.find('a.button').first().prop("download")).to.equal(expectedName);
		expect(refresh.find('a.button').first().prop("href")).to.equal(url);
		expect(refresh.find('svg').first().prop('role')).to.equal('img');
		expect(refresh.find('svg').first().prop('data-icon')).to.equal('download');
	});
});