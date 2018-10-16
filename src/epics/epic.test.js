import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import configureStore from "configure-store";
import { createEpicMiddleware, ActionsObservable } from 'redux-observable';
import { of, throwError } from 'rxjs';
import { QueryParseError } from 'lunr';

import rootEpic from './root-epic'
import { setDataset, selectDataset, selectConfiguration, selectFilteredDataset } from 'domain/dataset'
import { getError, setError } from 'domain/error'
import { setFilter } from 'domain/filter'
import { loadDataset, CSVconvert } from "./load-dataset-epic"
import { uploadDataset, fromJson } from "./upload-dataset-epic"
import { searchDataset } from "./search-dataset-epic"
import { filterDataset } from "./filter-dataset-epic"
import { fetchDataset, buildAuthHeader } from "./fetch-dataset-epic"
import refreshDatasetEpic from "./refresh-dataset-epic"
import { startRefresh, stopRefresh } from "./refresh-dataset-epic"
import { 
	buildIndex, 
	getSearchIndex,
	getSearchIndices,
	setSearchResults,
	getSearchResults,
	removeSearchIndex
} from "./index-dataset-epic"
import fetchDatasetEpic from "./fetch-dataset-epic"

const uuidv4 = require('uuid/v4');

describe("loadDatasetEpic", () => {
	let store;
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
	describe("loading various datasets", () => {
		it("loads the dataset with default config", (done) => {
			const owner = uuidv4();
			const data = [
			  { uid: "uid1", role: { role: "role", confidence: 80 } },
			  { uid: "uid2", role: { role: "role", confidence: 80 } }
			];

			const action$ = loadDataset({ 'owner': owner, 'content': data });
			store.dispatch(action$);
			let typeToCheck = setDataset.toString();
			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset).to.equal(data);

			done();
		});

		it("loads the dataset and config", (done) => {
			const owner = uuidv4();
			const dataset = [
	          { uid: "uid1", role: { role: "role", confidence: 80 } },
	          { uid: "uid2", role: { role: "role", confidence: 80 } }
	        ];
	        const configuration = {
	          fields: [
	            { path: ["uid"], displayName: "UID", groupable: true },
	            { path: ["role", "role"], displayName: "Role", groupable: false }
	          ]
	        };

			const action$ = loadDataset({ 'owner': owner, 'content': { 'dataset': dataset, 'configuration': configuration} });
			store.dispatch(action$);
			let typeToCheck = setDataset.toString();	

			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset).to.equal(dataset);
			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.configuration).to.equal(configuration);

			done();
		});

		it("loads a simple object", (done) => {
			const owner = uuidv4();
			const data = { uid: "uid1", role: { role: "role", confidence: 80 } };

			const action$ = loadDataset({ 'owner': owner, 'content': data });
			store.dispatch(action$);
			let typeToCheck = setDataset.toString();

			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset.length).to.equal(1);
			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset[0]).to.deep.equal(data);

			done();
		});
	});

	it("preserves control state across load", (done) => {
		const owner = uuidv4();
		const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];

		const action$ = loadDataset({ 'owner': owner, 'content': data });
		store.dispatch(action$);
		expect(store.getState()).to.deep.equal(initialState);

		done();
	});

	describe("CSV Conversion", () => {
		it("converts CSV to json", (done) => {
			const owner = uuidv4();
			const expectedData = [
			  { uid: "uid1", role: "role", confidence: "80" },
			  { uid: "uid2", role: "role", confidence: "80" }
			];
			const csv = "uid,role,confidence\n" +
						"uid1,role,80\nuid2,role,80"
			const converted = CSVconvert({ 'owner': owner, 'file': csv });
			expect(fromJson(converted).content).to.deep.equal(expectedData);

			done();
		});
	});

});

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

describe("indexDatasetEpic", () => {
	let store;
	const owner = uuidv4();
	const dataset = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];
	const configuration = {
	      fields: [
	        { path: ["uid"], displayName: "UID", groupable: true },
	        { path: ["role", "role"], displayName: "Role", groupable: false }
	      ]
	    };

	beforeEach(() => {

		store  = configureStore();
		const action$ = setDataset({ 'owner': owner, 'dataset': dataset });		
		store.dispatch(action$);
	});

	afterEach(() => {
		
	});

	it("sets the search index", (done) => {

	    const action$ = buildIndex({ 'owner': owner, 'dataset': dataset, 'configuration': configuration });
	    store.dispatch(action$);

	    const expectedConfiguration = {
	      fields: [
	        { path: ["uid"], displayName: "UID", groupable: true },
	        { path: ["role", "role"], displayName: "Role", groupable: false }
	      ]
	    };
	    const idx = getSearchIndex(store.getState(), owner);
	    expect(idx.fields.length).to.equal(expectedConfiguration.fields.length);

	    done();
	});

	it("sets the search index in a config with no fields", (done) => {
		const emptyConf = {};

	    const action$ = buildIndex({ 'owner': owner, 'dataset': dataset, 'configuration': emptyConf });
	    store.dispatch(action$);

	    const expectedFields = []//['uid', 'role.role', 'role.confidence'];
	    const idx = getSearchIndex(store.getState(), owner)

	    expect(idx.fields).to.deep.equal(expectedFields);

	    done();
	});

	it("sets the results of a search", (done) => {       

        const resultSet = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];
        const searchString = 'uid';

        const action$ = setSearchResults({
          queryString: searchString,
          results: resultSet
        });
        store.dispatch(action$);
        expect(getSearchResults(store.getState())).to.deep.equal(resultSet);

        done();
      });
});

describe("refreshDatasetEpic", () =>{
	//let store;

	beforeEach(() => {
		// const epicMiddleware = createEpicMiddleware();
		// const mockStore = configureMockStore([epicMiddleware]);
		// store = mockStore();
		// epicMiddleware.run(rootEpic);
	});

	afterEach(() => {
	});

	it("starts and stops the refresh timer", (done) => {
		const url ="test.test"
		const header = null;
		const interval = 10;
		//const expectedInterval = 10;
		const data = { 'url': url, 'header': header, 'interval': interval }
		// const start$ = startRefresh(data);
		// const stop$ = stopRefresh();
		const action$ = ActionsObservable.of(startRefresh(data));
		refreshDatasetEpic(action$).toPromise()
			.then((actionsOut) => {
				//console.log(actionsOut);
				expect(actionsOut.type).toBe(stopRefresh.toString());

			})
			.catch((error) => {
				expect(false).to.equal(true);
			})
		done();
		// store.dispatch(action$);
		// let typeToCheck = startRefresh.toString();
		// expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.url).to.equal(url);
		// expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.interval).to.equal(expectedInterval);

		// const stop$ = stopRefresh();
		// store.dispatch(stop$);
		// typeToCheck = stopRefresh.toString();
		// console.log(store.getActions());
		// expect(store.getActions().filter(a => a.type === typeToCheck).length).to.equal(1);
		// setImmediate(done());

		// const subscription = store.subscribe(() =>{
		// 	const actionsOut = store.getActions();
		// 	console.log(actionsOut);	
		// 	done();	
		// });

		// store.dispatch(start$);
		// let x=0;
		// while(x < 500000){
		// 	x++;
		// }
		// store.dispatch(stop$);
	});
})

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