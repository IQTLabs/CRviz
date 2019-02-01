import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware } from 'redux-observable';
import { of, throwError } from 'rxjs';

import rootEpic from './root-epic'
import { setError } from 'domain/error'
import { loadDataset } from "./load-dataset-epic"
import { fetchDataset, buildAuthHeader } from "./fetch-dataset-epic"

import fetchDatasetEpic from "./fetch-dataset-epic"

const uuidv4 = require('uuid/v4');

//use dependency injection to test this epic without having to hit a real URL
//so that we can get consisten test results regardless of connectivity
describe("fetchDatasetEpic", () => {
	const owner = uuidv4();
	const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];
	const mockResponse = data;
	const mockAjax = () => {
	  	return  of({ 'response': mockResponse });
	  }

	const errMsg = "Fetch Error Test";
	const mockAjaxError = () => {
		throwError(errMsg);
	}

	const dependencies = {
	  'ajax': mockAjax
	};

	let store;

	beforeEach(() => {
		const epicMiddleware = createEpicMiddleware();
		const mockStore = configureMockStore([epicMiddleware]);
		store  = mockStore();
		epicMiddleware.run(rootEpic, {'dependencies': dependencies});
	});

	afterEach(() => {
		
	});

	describe("Authorization headers", () => {

		it("uses no auth", (done) => {
			const expected = null;

			const actual = buildAuthHeader(null, null, null);
			expect(actual).to.deep.equal(expected);

			done();
		});

		it("uses basic auth", (done) => {
			const creds = new Buffer('test:test').toString('base64');
			const expected = {'Authorization': `Basic ${creds}`};

			const actual = buildAuthHeader('test', 'test', null);
			expect(actual).to.deep.equal(expected);

			done();
		});

		it("uses bearer auth", (done) => {
			const creds = 'testToken';
			const expected = {'Authorization': `Bearer ${creds}`};

			const actual = buildAuthHeader(null, null, creds);
			expect(actual).to.deep.equal(expected);

			done();
		});
	});

	it("fetches an array of data", (done) => {
		const url = 'test.test'
		let typeToCheck = loadDataset.toString();

		const action$ = of({'type': fetchDataset.toString(), 'payload': { 'owner': owner, 'url': url } });
		fetchDatasetEpic(action$, store, mockAjax)
			 .subscribe((actions) => {
				expect(actions.type).to.equal(typeToCheck);
				expect(actions.payload.content).to.equal(data);

				done();
			});
	});

	it("Encounters an error during fetch", (done) => {
		const url = 'test.test'
		let typeToCheck = setError.toString();

		const action$ = of({'type': fetchDataset.toString(), 'payload': { 'owner': owner, 'url': url } });
		fetchDatasetEpic(action$, store, mockAjaxError)
			 .subscribe((actions) => {
				expect(actions.type).to.equal(typeToCheck);
				expect(actions.payload).to.be.instanceOf(Error);

				done();
			});
	});
});