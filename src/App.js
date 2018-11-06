import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from 'react-modal';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faDizzy, faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";

import { selectDataset, getLastUpdated } from 'domain/dataset';
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

const uuidv4 = require('uuid/v4');

Modal.setAppElement('#root');

class App extends Component {

  state = {
    showData: true,
    showGrouping: false,
    showFiltering: false,
    uuid1: uuidv4(),
    uuid2: uuidv4(),
  }

  toggleShowData = () =>{
    this.setState({
      showData: !this.state.showData,
      showGrouping: false,
      showFiltering: false,
    });
  }

  toggleShowGrouping = () =>{
    this.setState({
      showData: false,
      showGrouping: !this.state.showGrouping,
      showFiltering: false
    });
  }

  toggleShowFiltering = () =>{
    this.setState({
      showData: false,
      showGrouping: false,
      showFiltering: !this.state.showFiltering
    });
  }

  onErrorClose = () => {
    this.props.clearError();
  }

  render() {
    const { dataset, darkTheme, error, lastUpdated } = this.props;
    const hasDataset = dataset && dataset.length > 0;

    const showData = this.state.showData;
    const showGrouping = this.state.showGrouping;

    console.log(lastUpdated);
    console.log(dataset.length);

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
          <div className={style.accordionHeader} onClick={this.toggleShowData}>
            Data  {!showData && <FontAwesomeIcon icon={faPlusCircle} />}{showData && <FontAwesomeIcon onClick={this.toggleShowData} icon={faMinusCircle} />}
          </div>
          <div>
            <div className={ classNames({ [style.section]: true, [style.hidden]: !showData }) }>
              <DatasetControls uuid={ this.state.uuid1 } datasets={ datasets }/>
            </div>
          </div>

          { hasDataset &&
            <div className={ classNames({ [style.section]: true, [style.hidden]: !showData }) }>
              <SearchControls />
            </div>
          }
          <div className={style.accordionHeader} onClick={this.toggleShowGrouping}>
            Grouping  {!showGrouping && <FontAwesomeIcon icon={faPlusCircle} />}{showGrouping && <FontAwesomeIcon  onClick={this.toggleShowGrouping} icon={faMinusCircle} />}
          </div>
          { hasDataset &&
            <div className={ classNames({ [style.section]: true, [style.hierarchySection]: true, [style.hidden]: !showGrouping }) }>
              <HierarchySelector />
            </div>
          }

          { hasDataset &&
            <div className={ classNames({ [style.section]: true, [style.hidden]: !showGrouping }) }>
              <MiscControls />
            </div>
          }
          { !hasDataset && <div className={ classNames({ [style.section]: true, [style.dimSection]:true, [style.hierarchySection]: true, [style.hidden]: !showGrouping }) }>
              Please select a dataset to continue
            </div>
          }
        </div>
        { dataset.length===0 && lastUpdated !== null &&
          <div  className={ style.emptyDataset }>
            <span>
              Current dataset is empty
            </span>
          </div>
        }

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
                    <div className="button circular" title="Ok" onClick={this.onErrorClose}>
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

const mapStateToProps = state => {
  const owner = Object.keys(state.dataset.datasets)[0] || ""
  return {
    dataset: selectDataset(state, owner),
    darkTheme: selectControls(state).darkTheme,
    error: getError(state),
    lastUpdated: getLastUpdated(state, owner),
  }
}

const mapDispatchToProps = {
  clearError
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
