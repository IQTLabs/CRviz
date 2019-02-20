import { expect } from 'chai';
import configureStore from "configure-store";

import { setDataset } from 'domain/dataset'
import { 
	buildIndex, 
	getSearchIndex,
	setSearchResults,
	getSearchResults
} from "./index-dataset-epic"

const uuidv4 = require('uuid/v4');

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

	    const expectedFields = ['uid', 'role.role', 'role.confidence'];
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