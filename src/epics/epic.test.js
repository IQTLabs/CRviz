import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import configureStore from "configure-store";
import { createEpicMiddleware, ActionsObservable } from 'redux-observable';
import { of} from 'rxjs';

import rootEpic from './root-epic'
import { setDataset } from 'domain/dataset'
import { loadDataset, CSVconvert } from "./load-dataset-epic"
import { uploadDataset } from "./upload-dataset-epic"
import { searchDataset } from "./search-dataset-epic"
import { fetchDataset, buildAuthHeader } from "./fetch-dataset-epic"
import refreshDatasetEpic from "./refresh-dataset-epic"
import { startRefresh, stopRefresh } from "./refresh-dataset-epic"
import { 
	buildIndex, 
	getSearchIndex,
	setSearchResults,
	getSearchResults
} from "./index-dataset-epic"
import fetchDatasetEpic from "./fetch-dataset-epic"

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
		it("loads the dataset with default config", () => {
			const data = [
			  { uid: "uid1", role: { role: "role", confidence: 80 } },
			  { uid: "uid2", role: { role: "role", confidence: 80 } }
			];

			const action$ = loadDataset(data);
			store.dispatch(action$);
			let typeToCheck = setDataset.toString();
			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset).to.equal(data);
		});

		it("loads the dataset and config", () => {
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

			const action$ = loadDataset({dataset, configuration});
			store.dispatch(action$);
			let typeToCheck = setDataset.toString();	

			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset).to.equal(dataset);
			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.configuration).to.equal(configuration);
		});

		it("loads a simple object", () => {
			const data = { uid: "uid1", role: { role: "role", confidence: 80 } };

			const action$ = loadDataset(data);
			store.dispatch(action$);
			let typeToCheck = setDataset.toString();
			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset.length).to.equal(1);
			expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset[0]).to.deep.equal(data);
		});
	});

	it("preserves control state across load", () => {
		const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];

		const action$ = loadDataset(data);
		store.dispatch(action$);
		expect(store.getState()).to.deep.equal(initialState);
	});

	describe("CSV Conversion", () => {
		it("converts CSV to json", () => {
			const expectedData = [
			  { uid: "uid1", role: "role", confidence: "80" },
			  { uid: "uid2", role: "role", confidence: "80" }
			];
			const csv = "uid,role,confidence\n" +
						"uid1,role,80\nuid2,role,80"
			const converted = CSVconvert(csv);

			expect(JSON.parse(converted)).to.deep.equal(expectedData);
		});
	});

});

describe("uploadDatasetEpic", () => {
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

	it("uploads a json file containing a dataset", () => {
		const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];
		const theBlob = new Blob([JSON.stringify(data)], { 'type': 'application/json' });

		const action$ = uploadDataset(theBlob);
		store.dispatch(action$);
		let typeToCheck = uploadDataset.toString();

		expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload).to.equal(theBlob);
	});

	it("uploads a csv file containing a dataset", () => {
		const csv = "uid,role.role,role.confidence\n" +
					"uid1,role,80\nuid2,role,80"
		const theBlob = new Blob([csv], { 'type': 'text/csv' });

		const action$ = uploadDataset(theBlob);
		store.dispatch(action$);
		let typeToCheck = uploadDataset.toString();

		expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload).to.equal(theBlob);
	});
});

describe("searchDatasetEpic", () => {
	let store;
	const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];

	beforeEach(() => {
		store  = configureStore();
		const action$ = setDataset({'dataset': data});		
		store.dispatch(action$);
		const config = store.getState().dataset.configuration;
		const indexAction$ = buildIndex({'dataset': data, 'configuration': config });
		store.dispatch(indexAction$);
	});

	afterEach(() => {
	});

	it("search a dataset", () => {
		const query = 'uid1';
		const ds = store.getState().dataset.dataset;
		const index = store.getState().search.searchIndex;

		const action$ = searchDataset({'dataset': ds, 'queryString': query, 'searchIndex': index});
		store.dispatch(action$);

		expect(action$.payload.results[0]).to.equal(data[0]);
	});

	it("search a for a non-existent field", () => {
		const query = 'fake: field';
		const ds = store.getState().dataset.dataset;
		const index = store.getState().search.searchIndex;

		const action$ = searchDataset({'dataset': ds, 'queryString': query, 'searchIndex': index});
		store.dispatch(action$);

		expect(action$.payload.results.length).to.equal(0);
	});

	it("clears a search", () => {
		const query = 'uid1';
		
		const ds = store.getState().dataset.dataset;
		const index = store.getState().search.searchIndex;

		const action$ = searchDataset({'dataset': ds, 'queryString': query, 'searchIndex': index});
		store.dispatch(action$);

		expect(action$.payload.results[0]).to.equal(data[0]);

		const clear = '';
		const clearAction$ = searchDataset({'dataset': ds, 'queryString': clear, 'searchIndex': index});
		store.dispatch(clearAction$);

		expect(clearAction$.payload.results.length).to.equal(0);
	});
});

//use dependency injection to test this epic without having to hit a real URL
//so that we can get consisten test results regardless of connectivity
describe("fetchDatasetEpic", () => {
	const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];
	const mockResponse = data;
	const mockAjax = () => {
	  	return  of({ 'response': mockResponse });
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

		it("uses no auth", () => {
			const expected = null;

			const actual = buildAuthHeader(null, null, null);
			expect(actual).to.deep.equal(expected);
		});

		it("uses basic auth", () => {
			const creds = new Buffer('test:test').toString('base64');
			const expected = {'Authorization': `Basic ${creds}`};

			const actual = buildAuthHeader('test', 'test', null);
			expect(actual).to.deep.equal(expected);
		});

		it("uses bearer auth", () => {
			const creds = 'testToken';
			const expected = {'Authorization': `Bearer ${creds}`};

			const actual = buildAuthHeader(null, null, creds);
			expect(actual).to.deep.equal(expected);
		});
	});

	it("loads the dataset with default config", () => {
		const url = 'test.test'
		let typeToCheck = loadDataset.toString();

		const action$ = of({'type': fetchDataset.toString(), 'payload': url});
		fetchDatasetEpic(action$, store, mockAjax)
			 .subscribe((actions) => {
				expect(actions.type).to.equal(typeToCheck);
				expect(actions.payload).to.equal(data);
			});
	});
});

describe("indexDatasetEpic", () => {
	let store;
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
		const action$ = setDataset({'dataset': dataset});		
		store.dispatch(action$);
	});

	afterEach(() => {
		
	});

	it("sets the search index", () => {

	    const action$ = buildIndex({ dataset, configuration });
	    store.dispatch(action$);

	    const expectedConfiguration = {
	      fields: [
	        { path: ["uid"], displayName: "UID", groupable: true },
	        { path: ["role", "role"], displayName: "Role", groupable: false }
	      ]
	    };
	    const idx = getSearchIndex(store.getState())
	    expect(idx.fields.length).to.equal(expectedConfiguration.fields.length);
	});

	it("sets the results of a search", () => {
        

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
      });
});

describe("refreshDatasetEpic", () =>{
	let store;

	beforeEach(() => {
		const epicMiddleware = createEpicMiddleware();
		const mockStore = configureMockStore([epicMiddleware]);
		store = mockStore();
		epicMiddleware.run(rootEpic);
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