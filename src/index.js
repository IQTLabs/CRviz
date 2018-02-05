import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

import configureStore from "./configure-store";

const store = configureStore();

store.dispatch({
  type: "SET_DATASET",
  payload: {
    dataset: [
      {
        uid: "uid",
        role: {
          role: "workstation",
          confidence: 91
        }
      },
      {
        uid: "uid2",
        role: {
          role: "workstation",
          confidence: 91
        }
      }
    ]
  }
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();

if (module.hot) {
  module.hot.accept("./App", () => {
    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById("root")
    );
  });
}
