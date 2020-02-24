import { expect } from 'chai';
import configureStore from "configure-store";
import { v4 as uuidv4 } from 'uuid';

import { setDataset, selectFilteredDataset } from 'domain/dataset'
import { setFilter } from 'domain/filter'
import { filterDataset } from "./filter-dataset-epic"

describe("filterDatasetEpic", () => {
	let store;
	const owner = uuidv4();
	const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];

	

	beforeEach(() => {
		store  = configureStore();
		const action$ = setDataset({ 'owner': owner, 'dataset': data });		
		store.dispatch(action$);
	});

	afterEach(() => {
	});

	it("filters a dataset", (done) => {
		const filterString = 'uid == "uid1"';

		const filterAction$ = setFilter(filterString);
		store.dispatch(filterAction$);

		const action$ = filterDataset({ 'owner': owner, 'dataset': data });
		store.dispatch(action$);

		expect(selectFilteredDataset(store.getState(), owner)[0]).to.equal(data[0]);

		done();
	});

	it("filters with an invalid filter", (done) => {
		const filterString = 'uid ==';

		const filterAction$ = setFilter(filterString);
		store.dispatch(filterAction$);

		const action$ = filterDataset({ 'owner': owner, 'dataset': data });
		store.dispatch(action$);

		expect(selectFilteredDataset(store.getState(), owner)).to.equal(null);

		done();
	});
});