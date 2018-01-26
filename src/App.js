import React, { Component } from "react";

import { Provider } from 'react-redux';

import configureStore from './configure-store';

class App extends Component {
  constructor(props) {
    super(props)

    this.store = configureStore();
  }

  componentDidMount() {
    this.store.dispatch({
      type: 'SET_DATASET',
      payload: {
        dataset: [
          {
            uid: 'uid',
            role: {
              role: 'workstation',
              confidence: 91
            }
          },
          {
            uid: 'uid2',
            role: {
              role: 'workstation',
              confidence: 91
            }
          }
        ],
        configuration: {}
      }
    })
  }

  render() {
    return (
      <Provider store={ this.store }>
        <div className="App">App</div>
      </Provider>
    );
  }
}

export default App;
