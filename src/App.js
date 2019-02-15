import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from 'react-modal';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheck, faDizzy, faPlus, faMinusCircle, faHome, faAngleDoubleDown, faAngleDoubleUp,
  //faFileExport, faFileImport
} from "@fortawesome/free-solid-svg-icons";

import { selectDatasets, getLastUpdated, removeDataset } from 'domain/dataset';
import { setHierarchyConfig, showNodes, colorBy, selectControls } from 'domain/controls';
import { getError, clearError } from "domain/error";
import { removeSearchIndex } from "epics/index-dataset-epic";

import Header from 'features/header/Header';
import HierarchySelector from 'features/hierarchy-selector/HierarchySelector';
import ComparisonSelector from 'features/comparison-selector/ComparisonSelector';
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
    uuids: [uuidv4()]
  }

  componentWillReceiveProps = (nextProps) =>{
    const uniqueUuids = Array.from(new Set(nextProps.uuids.concat(this.state.uuids)));
    this.setState({uuids: uniqueUuids});
  }

  toggleShowData = () =>{
    this.setState({
      showData: !this.state.showData,
      showComparison: false,
      showGrouping: false,
      showFiltering: false,
    });
  }

  toggleShowComparison = () =>{
    this.setState({
      showData: false,
      showComparison: !this.state.showComparison,
      showGrouping: false,
      showFiltering: false
    });
  }

  toggleShowGrouping = () =>{
    this.setState({
      showData: false,
      showComparison: false,
      showGrouping: !this.state.showGrouping,
      showFiltering: false
    });
  }

  toggleShowFiltering = () =>{
    this.setState({
      showData: false,
      showComparison: false,
      showGrouping: false,
      showFiltering: !this.state.showFiltering
    });
  }

  onErrorClose = () => {
    this.props.clearError();
  }

  resetControls = () => {
    this.props.colorBy(null);
    this.props.setHierarchyConfig([]);
    this.props.showNodes(true);
  }

  addDatasetEntry = () => {
    const uuids = this.state.uuids;
    uuids.push(uuidv4());
    this.setState({uuids: uuids})
  }

  removeDatasetEntry = (uuid) =>{
    if(this.state.uuids.includes(uuid)){
      this.state.uuids.splice(this.state.uuids.indexOf(uuid), 1);
    }
    this.props.removeSearchIndex(uuid);
    this.props.removeDataset(uuid);
  }

  render() {
    const { dataset, darkTheme, error, lastUpdated} = this.props;
    const hasDataset = dataset && dataset.length > 0;

    const uuids = this.state.uuids;
    const showData = this.state.showData;
    const showComparison = this.state.showComparison;
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
          <div className={ classNames({ [style.centerSpan]: true }) }>
            <div className="button circular" title="Reset Controls" size="3x" onClick={this.resetControls}>
              <FontAwesomeIcon icon={faHome} />
            </div>
          </div>
          <div className={style.accordionHeader} onClick={this.toggleShowData}>
            Data  {!showData && <FontAwesomeIcon icon={faAngleDoubleUp} />}{showData && <FontAwesomeIcon onClick={this.toggleShowData} icon={faAngleDoubleDown} />}
          </div>
          <div>
            {uuids.map((uuid, index) => {
              return(
                <div  key={ uuid } >
                  <div className={style.dataControlHeader}>
                    t{index}
                    {index > 0 && <FontAwesomeIcon icon={faMinusCircle} onClick={ () => {this.removeDatasetEntry(uuid)}} />}
                  </div>
                  <div className={ classNames({ [style.section]: true, [style.hidden]: !showData }) }>
                    <DatasetControls uuid={ uuid } datasets={ datasets }/>
                  </div>
                </div>
              )
            })}
            <span className={ style.centerSpan }>
              <div className="button circular" title="Add Dataset" onClick={this.addDatasetEntry}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </span>
          </div>

          { hasDataset &&
            <div className={ classNames({ [style.section]: true, [style.hidden]: !showData }) }>
              <SearchControls />
            </div>
          }

          <div className={style.accordionHeader} onClick={this.toggleShowComparison}>
            Comparison  {!showComparison && <FontAwesomeIcon icon={faAngleDoubleUp} />}{showComparison && <FontAwesomeIcon  onClick={this.toggleShowComparison} icon={faAngleDoubleDown} />}
          </div>
          { hasDataset &&
            <div className={ classNames({ [style.section]: true, [style.hierarchySection]: true, [style.hidden]: !showComparison }) }>
              <ComparisonSelector startUid={uuids[0]} endUid={uuids[1] || null} />
            </div>
          }
          { !hasDataset && 
            <div className={ classNames({ [style.section]: true, [style.dimSection]:true, [style.hierarchySection]: true, [style.hidden]: !showComparison }) }>
              Please select datasets to continue
            </div>
          }

          <div className={style.accordionHeader} onClick={this.toggleShowGrouping}>
            Grouping  {!showGrouping && <FontAwesomeIcon icon={faAngleDoubleUp} />}{showGrouping && <FontAwesomeIcon  onClick={this.toggleShowGrouping} icon={faAngleDoubleDown} />}
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
          { !hasDataset && 
            <div className={ classNames({ [style.section]: true, [style.dimSection]:true, [style.hierarchySection]: true, [style.hidden]: !showGrouping }) }>
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
          <Visualization startUid={uuids[0]} endUid={uuids[1] || null} />
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
  const datasets = selectDatasets(state);
  const uuids = Object.keys(datasets) || [uuidv4()];
  const dataset = datasets[uuids[0]] && datasets[uuids[0]].dataset ? datasets[uuids[0]].dataset : [];
  return {
    dataset: dataset,
    darkTheme: selectControls(state).darkTheme,
    error: getError(state),
    lastUpdated: getLastUpdated(state, uuids[0]),
    uuids: uuids
  }
}

const mapDispatchToProps = {
  clearError,
  setHierarchyConfig, 
  showNodes, 
  colorBy, 
  removeDataset,
  removeSearchIndex,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
