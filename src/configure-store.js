import { createStore, applyMiddleware, compose } from "redux";

import rootReducer from './domain/root-reducer';

// Replace redux compose with redux-devtools compose if it exists
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = (initialState = {}) => {
  const middlewares = [];

  return createStore(rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(...middlewares)
    )
  );
};

export default configureStore;
