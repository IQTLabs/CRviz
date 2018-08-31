import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from 'react-modal';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faDizzy } from "@fortawesome/free-solid-svg-icons";

import { selectDataset } from 'domain/dataset';
import { selectControls } from 'domain/controls';
import { getError, clearError } from "domain/error";

import Header from 'features/header/Header';
import HierarchySelector from 'features/hierarchy-selector/HierarchySelector';
import MiscControls from 'features/misc-controls/MiscControls';
import SearchControls from 'features/search/SearchControls';
import Visualization from 'features/visualization/Visualization';
import DatasetControls from 'features/dataset-controls/DatasetControls';

import style from './App.module.css';

import datasets from './datasets';

Modal.setAppElement('#root');

class App extends Component {

  onErrorClose = () => {
    this.props.clearError();
  }

  render() {
    const { dataset, darkTheme, error } = this.props;

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
        <Modal isOpen={ error !== null } onRequestClose={this.onErrorClose} contentLabel="An Error has occurred">
            <div className={ style.modal }>
              <div className={ style.modalMain }>
                <span className={ style.justifySpan }>
                   <div className={ style.icon } title="Error">
                        <FontAwesomeIcon icon={faDizzy} size="7x" color="#cc0000"/>
                    </div>
                    <div>
                      { error ? error.message : ""}
                    </div>
                </span>
                <div>
                  <span className={ style.centerSpan }>
                    <div className="button" title="Ok" onClick={this.onErrorClose}>
                        <FontAwesomeIcon icon={faCheck} />
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dataset: selectDataset(state),
  darkTheme: selectControls(state).darkTheme,
  error: getError(state)
});

const mapDispatchToProps = {
  clearError
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
