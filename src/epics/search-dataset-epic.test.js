import { expect } from 'chai';
import configureStore from "configure-store";
import { QueryParseError } from 'lunr';
import { v4 as uuidv4 } from 'uuid';

import { setDataset, selectDatasets, selectConfiguration } from 'domain/dataset'
import { getError } from 'domain/error'
import { searchDataset } from "./search-dataset-epic"
import { 
	buildIndices, 
	getSearchIndex,
	getSearchIndices,
	removeSearchIndex
} from "./index-dataset-epic"

describe("searchDatasetEpic", () => {
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

		const config = selectConfiguration(store.getState(), owner);
		let datasets ={};
		datasets[owner] = { 'dataset': data, 'configuration': config };

		const indexAction$ = buildIndices({ 'datasets': datasets });
		store.dispatch(indexAction$);
	});

	afterEach(() => {
	});

	it("search a dataset", (done) => {
		const query = 'uid1';
		const ds = selectDatasets(store.getState());
		const indices = getSearchIndices(store.getState());

		const action$ = searchDataset({'datasets': ds, 'queryString': query, 'searchIndices': indices});
		store.dispatch(action$);

		expect(action$.payload.results[0].uid).to.equal(data[0].uid);
		expect(action$.payload.results[0].CRVIZ._isSearchResult).to.equal(true);

		done();
	});

	it("search a for a non-existent field", (done) => {
		const query = 'fake: field';
		const ds = selectDatasets(store.getState());
		const indices = getSearchIndices(store.getState());

		const action$ = searchDataset({'datasets': ds, 'queryString': query, 'searchIndices': indices});
		store.dispatch(action$);

		expect(action$.payload.results.length).to.equal(0);
		expect(getError(store.getState())).to.be.instanceOf(QueryParseError);

		done();
	});

	it("clears a search", (done) => {
		const query = 'uid1';
		
		const ds = selectDatasets(store.getState());
		const indices = getSearchIndices(store.getState());

		const action$ = searchDataset({'datasets': ds, 'queryString': query, 'searchIndices': indices});
		store.dispatch(action$);

		expect(action$.payload.results[0].uid).to.equal(data[0].uid);
		expect(action$.payload.results[0].CRVIZ._isSearchResult).to.equal(true);

		const clear = '';
		const clearAction$ = searchDataset({'datasets': ds, 'queryString': clear, 'searchIndices': indices});
		store.dispatch(clearAction$);

		expect(clearAction$.payload.results.length).to.equal(0);

		done();
	});

	it("removes a search index", (done) => {
		const action = removeSearchIndex({ 'owner': owner });
		store.dispatch(action);
		
		expect(getSearchIndex(store.getState(), owner)).to.equal(null);

		done();
	})
});