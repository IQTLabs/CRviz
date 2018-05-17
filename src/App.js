import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';

import { selectDataset } from 'domain/dataset';
import { selectControls } from 'domain/controls';

import Header from 'features/header/Header';
import HierarchySelector from 'features/hierarchy-selector/HierarchySelector';
import MiscControls from 'features/misc-controls/MiscControls';
import SearchControls from 'features/search/SearchControls';
import Visualization from 'features/visualization/Visualization';
import DatasetControls from 'features/dataset-controls/DatasetControls';

import style from './App.module.css';

import datasets from './datasets';

class App extends Component {
  render() {
    const { dataset, darkTheme } = this.props;

    const hasDataset = dataset && dataset.length > 0;

    return (
      <div className={
          classNames({
            [style.appContainer]: true,
            'darkTheme': darkTheme
          })
      }>
        <input name="hideControls" id="hideControls" type="checkbox" />
        <label htmlFor="hideControls" className={ style.hideControls }>
          { /* <FontAwesomeIcon icon={faChevron} /> */ }
          <span>&lt;&lt;</span>
        </label>
        <div className={ style.controls }>
          <Header />
          <div className={ style.section }>
            <DatasetControls datasets={ datasets }/>
          </div>        

          { hasDataset &&
            <div className={ style.section }>
              <SearchControls />
            </div>
          }

          { hasDataset &&
            <div className={ classNames(style.section, style.hierarchySection) }>
              <HierarchySelector />
            </div>
          }

          { hasDataset &&
            <div className={ style.section }>
              <MiscControls />
            </div>
          }
        </div>

        <div className={ style.canvas }>
          <Visualization />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dataset: selectDataset(state),
  darkTheme: selectControls(state).darkTheme
});

export default connect(mapStateToProps)(App);
