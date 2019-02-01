import { expect } from 'chai';
import { ActionsObservable } from 'redux-observable';

import refreshDatasetEpic from "./refresh-dataset-epic"
import { startRefresh, stopRefresh } from "./refresh-dataset-epic"

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