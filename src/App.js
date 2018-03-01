import React, { Component } from "react";

import Header from 'features/header/Header';
import HierarchySelector from 'features/dnd-hierarchy-selector/HierarchySelector';
import MiscControls from 'features/misc-controls/MiscControls';
import Visualization from 'features/visualization/Visualization';
import DatasetControls from 'features/dataset-controls/DatasetControls';

import style from './App.module.css';

class App extends Component {
  render() {
    return (
      <div className={ style.appContainer }>
        <div className={ style.controls }>
          <Header />
          <DatasetControls />

          <div className={ style.section }>
            <HierarchySelector />
          </div>

          <div className={ style.section }>
            <MiscControls />
          </div>
        </div>
        <div className={ style.canvas }>
          <Visualization />
        </div>
      </div>
    );
  }
}

export default App;
