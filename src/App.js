import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from 'react-modal';

import { RingLoader } from 'react-spinners';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheck, faDizzy, faPlus, faHome, faAngleDoubleDown, faAngleDoubleUp,
  faFileExport, faFileImport, faTimes
} from "@fortawesome/free-solid-svg-icons";

import { 
  selectDatasets, getLastUpdated, removeDataset,getKeyFields, getIgnoredFields
} from 'domain/dataset';
import { 
  setHierarchyConfig, showNodes, colorBy, selectControls, setStartDataset, setEndDataset,
  showBusy
} from 'domain/controls';
import { getError, clearError } from "domain/error";
import { removeSearchIndex } from "epics/index-dataset-epic";
import { uploadDataset } from "epics/upload-dataset-epic";

import Header from 'features/header/Header';
import HierarchySelector from 'features/hierarchy-selector/HierarchySelector';
import ComparisonSelector from 'features/comparison-selector/ComparisonSelector';
import MiscControls from 'features/misc-controls/MiscControls';
import SearchControls from 'features/search/SearchControls';
import Visualization from 'features/visualization/Visualization';
import DatasetControls from 'features/dataset-controls/DatasetControls';
import DatasetSlider from 'features/dataset-controls/DatasetSlider';
import DatasetUpload from 'features/dataset-controls/DatasetUpload';
import { getDataToExport } from "features/dataset-controls/export"

import style from './App.module.css';

import datasets from './datasets';

const uuidv4 = require('uuid/v4');

Modal.setAppElement('#root');
const IMPORT = "import";
const EXPORT = "export";
const DATA = "data";
const CONTROLS = "controls";
const defaultOptions = {
      action: "",
      data: true,
      controls: true
    }
class App extends Component {

  state = {
    showData: true,
    showGrouping: false,
    showFiltering: false,
    uuids: [{'owner': uuidv4(), 'name': 'Series 0', 'shortName': 's0'}],
    datasetAdded: false,
    startUuid: null,
    endUuid: null,
    showOptions: false,
    options:{
      action: "",
      data: true,
      controls: true
    },
    selectedFile: null,
    exportName: "dataset.json",
  }

  componentWillReceiveProps = (nextProps) =>{
    const datasetAdded = this.state.datasetAdded && (nextProps.uuids.length !== this.state.uuids.length)
    const uniqueUuids = this.getUniqueDatasetList(datasetAdded, this.state.uuids, nextProps.uuids);
    const startUuid = nextProps.startUuid && uniqueUuids.findIndex(u => u.owner === nextProps.startUuid) !== -1 ? nextProps.startUuid : this.state.startUuid;
    const endUuid = nextProps.endUuid && uniqueUuids.findIndex(u => u.owner === nextProps.endUuid) !== -1 ? nextProps.endUuid : this.state.endUuid;
    this.setState({
      uuids: uniqueUuids,
      startUuid: startUuid,
      endUuid: endUuid,
      datasetAdded: datasetAdded,
    });
  }

  getUniqueDatasetList = (datasetAdded, uuidsFromState, uuidsFromProps) => {
    let result = [];

    if(datasetAdded || uuidsFromProps.length === 0){
      const uniqueOwners = new Set();
      uuidsFromProps.concat(uuidsFromState).forEach((u) => {
        if(!uniqueOwners.has(u.owner)){
          uniqueOwners.add(u.owner);
          result.push(u);
        }
      });
    }
    else {
      result = uuidsFromProps;
    }

    return result;
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

  showImportOptions = () => {
    this.showOptions(IMPORT);
  }

  showExportOptions = () => {
    this.showOptions(EXPORT);
  }

  showOptions = (action) => {
    this.setOptions("action", action);
    this.setState({showOptions: true})
  }

  processOptions = () => {
    if(this.state.options.action === IMPORT)
    {
      this.props.showBusy(true);
      if(this.state.selectedFile){
        this.props.uploadDataset({
          'owner': uuidv4(),
          'file': this.state.selectedFile,
          'includeData': this.state.options.data,
          'includeControls': this.state.options.controls,
        })
      }
      this.setState({showOptions: false })
    }
  }

  onUpload = (file) => {
    this.setState({
      selectedFile: file,
    });
  }

  getDownloadUrl = () => {
    const datasets = this.state.options.data && this.props.fullDatasets;
    const controls = this.state.options.controls && this.props.controls;
    const keyFields = this.state.options.data && this.props.keyFields;
    const ignoredFields = this.state.options.data && this.props.ignoredFields;
    const exportData = getDataToExport(datasets, keyFields, ignoredFields, controls)
    const urlObject = window.URL || window.webkitURL || window;
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], {'type': "application/json"});
    const url = urlObject.createObjectURL(blob);;
    return url;
  }

  exportNameChange = (name) => {
    this.setState({
      exportName: name,
    });
  }

  cancelOptions = () => {
    this.setState({
      showOptions: false,
      options: defaultOptions
    })
  }

  setOptions = (key, value) => {
    const options = this.state.options;
    options[key] = value;
    this.setState({options: options});
  }

  addDatasetEntry = () => {
    const uuids = this.state.uuids;
    const newItem = { 'owner': uuidv4(), 'name': 'Series ' + uuids.length, 'shortName': 's' + uuids.length };
    uuids.push(newItem);
    this.setState({
      uuids: uuids,
      datasetAdded: true
    });
  }

  removeDatasetEntry = (uuid) =>{
    const uuids = this.state.uuids;
    if(uuids.includes(uuid)){
      const newUuids = uuids.splice(uuids.indexOf(uuid), 1);
      this.setState({uuids: newUuids})
    }
    this.props.removeSearchIndex({'owner': uuid});
    this.props.removeDataset({'owner': uuid});
  }

  setStartUuid = (uuid) =>{
    this.setState({startUuid: uuid});
    this.props.setStartDataset(uuid);
  }

  setEndUuid = (uuid) =>{
    this.setState({endUuid: uuid});
    this.props.setEndDataset(uuid);
  }

  render() {
    const { datasetCount, darkTheme, error, lastUpdated} = this.props;
    const hasDataset = datasetCount > 0;

    const uuids = this.state.uuids;
    const startUuid = this.state.startUuid;
    const endUuid = this.state.endUuid;
    const showData = this.state.showData;
    const showComparison = this.state.showComparison;
    const showGrouping = this.state.showGrouping;
    const showOptions = this.state.showOptions;
    const options = this.state.options;

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
            {uuids.map((uuid) => {
              return(
                <div  key={ uuid.owner + "_container" } >
                  <DatasetControls 
                    uuid={ uuid.owner }
                    name={ uuid.name }
                    shortName={ uuid.shortName }
                    removeDatasetEntry={ this.removeDatasetEntry }
                    removable={uuids.length > 1}
                    datasets={ datasets }/>
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
          <div className={style.footerContainer}>
            <span className={ style.centerSpan }>
                <div className="button circular" title="Import Dataset" onClick={this.showImportOptions}>
                  <FontAwesomeIcon icon={faFileImport} />
                </div>
                <div className="button circular" disabled={!hasDataset} title="Export Dataset" onClick={this.showExportOptions}>
                  <FontAwesomeIcon icon={faFileExport} />
                </div>
            </span>
          </div>
        </div>
        { datasetCount === 0 && lastUpdated !== null &&
          <div  className={ style.emptyDataset }>
            <span>
              Current dataset is empty
            </span>
          </div>
        }

        <div className={ style.canvas }>
          <Visualization startUid={startUuid} endUid={endUuid} />
        </div>
        <div className={ classNames({ [style.sliderContainer]: true, [style.hidden]: datasetCount < 2 }) } >
          <DatasetSlider points={uuids} startUuid={startUuid} endUuid={endUuid} 
            setStartUuid={this.setStartUuid} setEndUuid={this.setEndUuid} />
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
        <Modal isOpen={ showOptions } onRequestClose={this.cancelOptions} contentLabel="An Error has occurred">
          <div className={ style.modal }>
            <div className={ style.modalMain }>
              {options.action === IMPORT &&
                <div className={style.uploadContainer}>
                  <span className={style.label}>Upload</span>
                  <DatasetUpload
                    ownerUuid={uuidv4()}
                    className={style.fileUpload}
                    selected={this.state.selectedFile ? this.state.selectedFile.name : null}
                    onChange={this.onUpload}
                  />
                </div>
                }
                {options.action === EXPORT &&
                <div className={style.uploadContainer}>
                  <span className={style.label}>Export As</span>
                  <input
                    type="text"
                    id="export-as"
                    value={this.state.exportName}
                    onChange={(evt) => this.exportNameChange(evt.target.value)}
                  />
                </div>
                }
              <div className={style.container}>
                <div className={`${style.checkboxContainer} input-group`}>
                  <div className={ style.switch }>
                    <input
                      type="checkbox"
                      id="data-check"
                      checked={options.data}
                      onChange={(evt) => this.setOptions(DATA, evt.target.checked)}
                    />
                    <label htmlFor="data-check" className={ style.switchLabel }>
                    </label>
                  </div>
                  <label >Data</label>
                </div>
                <div className={`${style.checkboxContainer} input-group`}>
                  <div className={ style.switch }>
                    <input
                      type="checkbox"
                      id="controls-check"
                      checked={options.controls}
                      onChange={(evt) => this.setOptions(CONTROLS, evt.target.checked)}
                    />
                    <label htmlFor="controls-check" className={ style.switchLabel }>
                    </label>
                  </div>
                  <label >Controls</label>
                </div>
              </div>
              <div>
                <span className={ style.centerSpan }>
                  {options.action === IMPORT &&
                    <div className="button circular" title="Ok" 
                         disabled={options.action === IMPORT && !this.state.selectedFile} 
                         onClick={this.processOptions}>
                        <FontAwesomeIcon icon={faCheck} />
                    </div>
                  }
                  {options.action === EXPORT &&
                    <a className="button circular" href={ this.getDownloadUrl() } download={ this.state.exportName }
                      title="Download" disabled={!hasDataset} onClick={this.cancelOptions} >
                      <FontAwesomeIcon icon={faCheck} />
                    </a>
                  }
                  <div className="button circular" title="Cancel" onClick={this.cancelOptions}>
                      <FontAwesomeIcon icon={faTimes} />
                  </div>
                </span>
              </div>
            </div>
          </div>
        </Modal>
        <div className={style.activityIndicatorContainer}>
          <RingLoader
            sizeUnit={"px"}
            size={150}
            color={'#0277BD'}
            loading={this.props.shouldShowBusy}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const datasets = selectDatasets(state);
  const uuids = Object.keys(datasets).map(key => ({ 'owner': key, 'name': datasets[key].name, 'shortName': datasets[key].shortName })) 
                || [{ 'owner': uuidv4(), 'name': "Series 0", 'shortName': "s0" }];
  const datasetCount = uuids.length;
  const controls = selectControls(state);

  return {
    datasetCount: datasetCount,
    darkTheme: controls.darkTheme,
    error: getError(state),
    lastUpdated: getLastUpdated(state, uuids[0]),
    uuids: uuids,
    startUuid: controls.start,
    endUuid: controls.end,
    fullDatasets: datasets,
    controls: controls,
    keyFields: getKeyFields(state),
    ignoredFields: getIgnoredFields(state),
    shouldShowBusy: controls.showBusy,
  }
}

const mapDispatchToProps = {
  clearError,
  setHierarchyConfig, 
  showNodes, 
  colorBy, 
  removeDataset,
  removeSearchIndex,
  setStartDataset,
  setEndDataset,
  uploadDataset,
  showBusy,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
