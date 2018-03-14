import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';


import { selectControls } from 'domain/controls';

import Header from 'features/header/Header';
import HierarchySelector from 'features/hierarchy-selector/HierarchySelector';
import MiscControls from 'features/misc-controls/MiscControls';
import Visualization from 'features/visualization/Visualization';
import DatasetControls from 'features/dataset-controls/DatasetControls';

import style from './App.module.css';

class App extends Component {
  render() {
    const darkTheme = this.props.darkTheme;
    return (
      <div className={
          classNames({
            [style.appContainer]: true,
            'darkTheme': darkTheme
          })
      }>
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

const mapStateToProps = (state) => ({
  darkTheme: selectControls(state).darkTheme
});

export default connect(mapStateToProps)(App);
