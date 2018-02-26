import { createStore, applyMiddleware, compose } from "redux";

import { createEpicMiddleware } from 'redux-observable';
import rootReducer from './domain/root-reducer';
import rootEpic from './epics/root-epic';

// Replace redux compose with redux-devtools compose if it exists
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = (initialState = {}) => {
  const middlewares = [
    createEpicMiddleware(rootEpic)
  ];

  return createStore(rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(...middlewares)
    )
  );
};

export default configureStore;
