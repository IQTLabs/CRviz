import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import configureStore from "configure-store";
import { createEpicMiddleware } from 'redux-observable';

import rootEpic from './root-epic'
import { getError } from 'domain/error'
import { uploadDataset } from "./upload-dataset-epic"

const uuidv4 = require('uuid/v4');

describe("uploadDatasetEpic", () => {
	let store;
	const owner = uuidv4();
	const initialState ={
			'controls': {
				'hierarchyConfig':{'path': ['test'], 'displayName': 'test', 'groupable': true},
				'colorBy':{'path': ['test'], 'displayName': 'test', 'groupable': true}
			}
		};

	beforeEach(() => {
		const epicMiddleware = createEpicMiddleware();
		const mockStore = configureMockStore([epicMiddleware]);
		store  = mockStore(initialState);
		epicMiddleware.run(rootEpic);
	});

	afterEach(() => {
		
	});

	it("uploads a json file containing a dataset", (done) => {
		const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];
		const theBlob = new Blob([JSON.stringify(data)], { 'type': 'application/json' });

		const action$ = uploadDataset({ 'owner': owner, 'file': theBlob });
		store.dispatch(action$);
		let typeToCheck = uploadDataset.toString();

		expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.file).to.equal(theBlob);
		done();
	});

	it("uploads a csv file containing a dataset", (done) => {
		const csv = "uid,role.role,role.confidence\n" +
					"uid1,role,80\nuid2,role,80"
		const theBlob = new Blob([csv], { 'type': 'text/csv' });

		const action$ = uploadDataset({ 'owner': owner, 'file': theBlob });
		store.dispatch(action$);
		let typeToCheck = uploadDataset.toString();

		expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.file).to.equal(theBlob);

		done();
	});

	it("fails to upload a file containing only text", (done) => {
		store = configureStore();
		const text = "This is not json or csv"
		const expectedMessage = "Invalid JSON."
		const theBlob = new Blob([text], { 'type': 'text/plain' });

		const action$ = uploadDataset({ 'owner': owner, 'file': theBlob });

		store.subscribe(() => {
			if(getError(store.getState())){
				expect(getError(store.getState()).toString()).to.contain(expectedMessage);
				done();
			}			
		});

		store.dispatch(action$);
	})
});