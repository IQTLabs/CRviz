import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from 'react-modal';

import { isNil } from "ramda";
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
    uuids: [uuidv4()],
    datasetAdded: false,
    startUuid: null,
    endUuid: null,
  }

  componentWillReceiveProps = (nextProps) =>{
    const uniqueUuids = this.state.datasetAdded || nextProps.uuids.length === 0
                        ? Array.from(new Set(nextProps.uuids.concat(this.state.uuids)))
                        : nextProps.uuids;
    if(!this.state.startUuid){
      this.setState({startUuid: uniqueUuids[0]});
    }
    this.setState({
      uuids: uniqueUuids,
      datasetAdded: false
    });
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
    const newItem = uuidv4()
    uuids.push(newItem);
    this.setState({uuids: uuids});
    if(this.state.endUuid === null){
      this.setEndUuid(newItem);
    }
    this.setState({datasetAdded: true});
  }

  removeDatasetEntry = (uuid) =>{
    const uuids = this.state.uuids;
    if(uuids.includes(uuid)){
      const newUuids = uuids.splice(uuids.indexOf(uuid), 1);
      console.log("uuids after remove %o", newUuids);
      this.setState({uuids: newUuids})
    }
    this.props.removeSearchIndex({'owner': uuid});
    this.props.removeDataset({'owner': uuid});
  }

  setStartUuid = (uuid) =>{
    this.setState({startUuid: uuid});
  }

  setEndUuid = (uuid) =>{
    this.setState({endUuid: uuid});
  }

  render() {
    const { dataset, darkTheme, error, lastUpdated} = this.props;
    const hasDataset = dataset && dataset.length > 0;

    const uuids = this.state.uuids;
    const startUuid = this.state.startUuid;
    const endUuid = this.state.endUuid;
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
            Data  {!showData && <FontAwesomeIcon icon={faAngleDoubleDown} />}{showData && <FontAwesomeIcon onClick={this.toggleShowData} icon={faAngleDoubleUp} />}
          </div>
          <div className={ classNames({ [style.section]: true, [style.hidden]: !showData })}>
            {uuids.map((uuid, index) => {
              return(
                <div  key={ uuid } >
                  <div className={style.dataControlHeader}>
                    t{index}
                    {index > 0 && <FontAwesomeIcon icon={faMinusCircle} onClick={ () => {this.removeDatasetEntry(uuid)}} />}
                  </div>
                  <DatasetControls uuid={ uuid } datasets={ datasets }/>
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
            Comparison  {!showComparison && <FontAwesomeIcon icon={faAngleDoubleDown} />}{showComparison && <FontAwesomeIcon  onClick={this.toggleShowComparison} icon={faAngleDoubleUp} />}
          </div>
          { hasDataset &&
            <div className={ classNames({ [style.section]: true, [style.hierarchySection]: true, [style.hidden]: !showComparison }) }>
              <ComparisonSelector startUid={startUuid} endUid={endUuid} />
              <div className={style.selectorContainer}>
                <span className={style.label}>Start</span>
                <div className={style.selector}>
                  <label className="select">
                  <select
                    onChange={(evt) => this.setStartUuid(evt.target.value)}
                    value={isNil(startUuid) ? "" : startUuid}
                  >
                    <option value="">&mdash;None&mdash;</option>
                    {uuids.map((uuid, index) => {
                      return (
                        <option key={uuid} value={uuid}>
                          t{index}
                        </option>
                      );
                    })}
                  </select>
                  </label>
                </div>
              </div>
              <div className={style.selectorContainer}>
                <span className={style.label}>End</span>
                <div className={style.selector}>
                  <label className="select">
                  <select
                    onChange={(evt) => this.setEndUuid(evt.target.value)}
                    value={isNil(endUuid) ? "" : endUuid}
                  >
                    <option value="">&mdash;None&mdash;</option>
                    {uuids.map((uuid, index) => {
                      return (
                        <option key={uuid} value={uuid}>
                          t{index}
                        </option>
                      );
                    })}
                  </select>
                  </label>
                </div>
              </div>
            </div>
          }
          { !hasDataset && 
            <div className={ classNames({ [style.section]: true, [style.dimSection]:true, [style.hierarchySection]: true, [style.hidden]: !showComparison }) }>
              Please select datasets to continue
            </div>
          }

          <div className={style.accordionHeader} onClick={this.toggleShowGrouping}>
            Grouping  {!showGrouping && <FontAwesomeIcon icon={faAngleDoubleDown} />}{showGrouping && <FontAwesomeIcon  onClick={this.toggleShowGrouping} icon={faAngleDoubleUp} />}
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
          <Visualization startUid={startUuid} endUid={endUuid} />
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
