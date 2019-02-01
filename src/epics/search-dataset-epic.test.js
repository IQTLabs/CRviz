import { expect } from 'chai';
import configureStore from "configure-store";
import { QueryParseError } from 'lunr';

import { setDataset, selectDataset, selectConfiguration } from 'domain/dataset'
import { getError } from 'domain/error'
import { searchDataset } from "./search-dataset-epic"
import { 
	buildIndex, 
	getSearchIndex,
	getSearchIndices,
	removeSearchIndex
} from "./index-dataset-epic"

const uuidv4 = require('uuid/v4');

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
		const indexAction$ = buildIndex({ 'owner': owner, 'dataset': data, 'configuration': config });
		store.dispatch(indexAction$);
	});

	afterEach(() => {
	});

	it("search a dataset", (done) => {
		const query = 'uid1';
		const ds = selectDataset(store.getState(), owner);
		const indices = getSearchIndices(store.getState());

		const action$ = searchDataset({'dataset': ds, 'queryString': query, 'searchIndices': indices});
		store.dispatch(action$);

		expect(action$.payload.results[0]).to.equal(data[0]);

		done();
	});

	it("search a for a non-existent field", (done) => {
		const query = 'fake: field';
		const ds = selectDataset(store.getState(), owner);
		const indices = getSearchIndices(store.getState());

		const action$ = searchDataset({'dataset': ds, 'queryString': query, 'searchIndices': indices});
		store.dispatch(action$);

		expect(action$.payload.results.length).to.equal(0);
		expect(getError(store.getState())).to.be.instanceOf(QueryParseError);

		done();
	});

	it("clears a search", (done) => {
		const query = 'uid1';
		
		const ds = selectDataset(store.getState(), owner);
		const indices = getSearchIndices(store.getState());

		const action$ = searchDataset({'dataset': ds, 'queryString': query, 'searchIndices': indices});
		store.dispatch(action$);

		expect(action$.payload.results[0]).to.equal(data[0]);

		const clear = '';
		const clearAction$ = searchDataset({'dataset': ds, 'queryString': clear, 'searchIndices': indices});
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