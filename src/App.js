import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from 'react-modal';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faDizzy, faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";

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

const uuidv4 = require('uuid/v4');

Modal.setAppElement('#root');

class App extends Component {

  state = {
    showData: true,
    showGrouping: false
  }

  toggleShowData = () =>{
    this.setState({
      showData: !this.state.showData,
      showGrouping: false
    });
  }

  toggleShowGrouping = () =>{
    this.setState({
      showData: false,
      showGrouping: !this.state.showGrouping
    });
  }

  onErrorClose = () => {
    this.props.clearError();
  }

  render() {
    const { dataset, darkTheme, error } = this.props;

    const hasDataset = dataset && dataset.length > 0;

    const showData = this.state.showData;
    const showGrouping = this.state.showGrouping;
    
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
          <div className={style.accordionHeader}>
            Data  {!showData && <FontAwesomeIcon onClick={this.toggleShowData} icon={faPlusCircle} />}{showData && <FontAwesomeIcon onClick={this.toggleShowData} icon={faMinusCircle} />}
          </div> 
          {showData && 
            <div>
              <div className={ style.section }>
                <DatasetControls uuid={ uuidv4() } datasets={ datasets }/>
              </div> 

              <div className={ style.section }>
                <DatasetControls uuid={ uuidv4() } datasets={ datasets }/>
              </div> 
            </div>
          }       

          { hasDataset && showData &&
            <div className={ style.section }>
              <SearchControls />
            </div>
          }
          <div className={style.accordionHeader}>
            Grouping  {!showGrouping && <FontAwesomeIcon onClick={this.toggleShowGrouping} icon={faPlusCircle} />}{showGrouping && <FontAwesomeIcon onClick={this.toggleShowGrouping} icon={faMinusCircle} />}
          </div> 
          { hasDataset && showGrouping &&
            <div className={ classNames(style.section, style.hierarchySection) }>
              <HierarchySelector />
            </div>
          }

          { hasDataset && showGrouping &&
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

const mapStateToProps = state => {
  const hash = Object.keys(state.dataset.datasets)[0] || ""
  return {
    dataset: selectDataset(state, hash),
    darkTheme: selectControls(state).darkTheme,
    error: getError(state)
  }
}

const mapDispatchToProps = {
  clearError
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
