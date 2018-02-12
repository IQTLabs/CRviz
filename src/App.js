import React, { Component } from "react";

import HierarchySelector from 'features/hierarchy-selector/HierarchySelector';
import MiscControls from 'features/misc-controls/MiscControls';
import Visualization from 'features/visualization/Visualization';
import style from './App.module.css';

class App extends Component {
  render() {
    return (
      <div className={ style.appContainer }>
        <div className={ style.controls }>
          <h2>Hierarchy</h2>
          <HierarchySelector />

          <h2>Controls</h2>
          <MiscControls />
        </div>
        <div className={ style.canvas }>
          <Visualization />
        </div>
      </div>
    );
  }
}

export default App;
