import { expect } from 'chai';
import configureStore from "configure-store";
import { v4 as uuidv4 } from 'uuid';

import { 
	setDataset,
	selectMergedConfiguration,
	selectDatasetDiff,
	applyHashes
} from 'domain/dataset'
import { diffDataset } from "./diff-dataset-epic"

describe("diffDatasetEpic", () => {
	let store;
	const startOwner = uuidv4();
	const startData = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];
	const endOwner = uuidv4();
	const endData = [
		  { uid: "uid3", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "other-role", confidence: 80 } }
		];

	beforeEach(() => {
		store  = configureStore();
		const startAction$ = setDataset({ 'owner': startOwner, 'dataset': startData });		
		store.dispatch(startAction$);
		const endAction$ = setDataset({ 'owner': endOwner, 'dataset': endData });		
		store.dispatch(endAction$);
	});

	afterEach(() => {
	});

	it("diff a dataset", (done) => {
		const config = selectMergedConfiguration(store.getState());
		const key = config.fields.filter(f => f.displayName === 'uid')
		const ignore =[];
		config.keyFields = key;
		config.hashFields = config.fields;

		const startDs = { 'owner': startOwner, 'dataset': startData };
		applyHashes(startDs.dataset, config);

		const endDs = { 'owner': endOwner, 'dataset':endData };
		applyHashes(endDs.dataset, config);

		const action$ = diffDataset({
			'start': startDs, 
			'end': endDs, 
			'configuration': config,
			'key': key, 'ignore':ignore
		});
		store.dispatch(action$);
		const diffs = selectDatasetDiff(store.getState(), startOwner, endOwner);
		
		expect(diffs.added.length).to.equal(1);
		expect(diffs.removed.length).to.equal(1);
		expect(diffs.changed.length).to.equal(1);
		done();
	});
});