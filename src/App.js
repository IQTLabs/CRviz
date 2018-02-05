import React, { Component } from "react";


import HierarchySelector from 'features/hierarchy-selector/HierarchySelector';

import style from './App.module.css';

class App extends Component {
  render() {
    return (
      <div className={ style.appContainer }>
        <div className={ style.controls }>
          <h1>Hierarchy</h1>
          <HierarchySelector />
        </div>
        <div className={ style.canvas }>
          &nbsp;
        </div>
      </div>
    );
  }
}

export default App;
