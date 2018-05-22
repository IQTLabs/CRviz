import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware } from 'redux-observable';

import rootEpic from './root-epic'
import { loadDataset,loadDatasetEpic } from "./load-dataset-epic"

const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

describe("loadDatasetEpic", () => {
	let store;

	beforeEach(() => {
		store  = mockStore();
	});

	afterEach(() => {
		epicMiddleware.replaceEpic(rootEpic);
	});

	it("loads the dataset", () => {
		const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];

		const action$ = loadDataset(data);
		console.log(action$);
		store.dispatch(action$);
		let typeIHopeFor = loadDataset.toString();
		console.log(typeIHopeFor);
		let actions = store.getActions();
		let thing = actions.filter(a => a.type === typeIHopeFor);
		console.log(thing[0].payload
			);
		console.log(store.getState());

		expect(store.getActions().filter(a => a.type === typeIHopeFor)[0].payload).toEqual(data);
	});
});