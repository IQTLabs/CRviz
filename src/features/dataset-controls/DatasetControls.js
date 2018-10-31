import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { isNil } from "ramda";
import Modal from 'react-modal';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faCog } from "@fortawesome/free-solid-svg-icons";

import { fetchDataset, buildAuthHeader } from "epics/fetch-dataset-epic";
import { startRefresh, stopRefresh } from "epics/refresh-dataset-epic";
import { uploadDataset } from "epics/upload-dataset-epic";
import { removeSearchIndex } from "epics/index-dataset-epic";
import { showNodes, setHierarchyConfig, colorBy } from "domain/controls"

import { setError } from "domain/error"
import { setDataset, selectDataset, removeDataset, getIsFetching, setIsFetching, getLastUpdated } from "domain/dataset";

import DatasetSelector from "./DatasetSelector";
import DatasetUpload from "./DatasetUpload";
import DatasetDownload from "./DatasetDownload";
import DatasetRefresh from "./DatasetRefresh";
import DatasetTimedRefresh from "./DatasetTimedRefresh";

import style from "./DatasetControls.module.css";

const uuidv4 = require('uuid/v4');

const CUSTOM_DATASET = {
  name: "Custom URL",
  url: "custom-url"
};

const authTypes = [
  {'name': '-None-', 'scheme':'None' },
  {'name': 'Username\\Password', 'scheme':'Basic' },
  {'name': 'Token', 'scheme':'Bearer' },
];

var host = window.location.host;
var hostname = window.location.hostname;
var port = '80';
const radix = 10;
if (host.indexOf(':') > -1) {
  port = String(parseInt(host.split(":")[1], radix)-1);
}

var POSEIDON_DATASET = {
  name: "Poseidon Network",
  url: "http://"+hostname+":"+port+"/v1/network"
};

Modal.setAppElement('#root');

class DatasetControls extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dataset: null,
      selected: null,
      selectedFile: null,
      showUrlEntry: false,
      url: '',
      authScheme:'',
      token: '',
      username: '',
      password: '',
      refreshInterval: 0,
      refreshTimerRunning: false
    };
  }

  resetDataset = () => {
    this.props.setDataset({ dataset: [], configuration: {} });
    this.setState({
      selected: null,
      selectedFile: null
    });
  }

  fetchAndSetDataset = (url, dataset, username, password, token) => {
    this.props.setIsFetching({owner: this.props.uuid, isFetching: true});
    const authHeader = buildAuthHeader(username, password, token);
    if (toURL(url)) {
      this.props.fetchDataset({ 'owner': this.props.uuid, 'url': url, 'header': authHeader });
      this.setState({
        selected: dataset,
        selectedFile: null,
      });
    } else {
      this.props.setError(new Error("Please enter a valid URL."));
    }
  }

  onSelected = (dataset) => {
    if (isNil(dataset)) {
      return this.resetDataset();
    }

    this.props.removeDataset({owner: this.props.uuid});
    this.props.removeSearchIndex({owner: this.props.uuid});
    this.props.setHierarchyConfig([]);
    this.props.colorBy(null);
    this.props.showNodes(true);
    this.props.stopRefresh();

    const showUrlEntry = dataset === CUSTOM_DATASET;
    this.setState({ 
      showUrlEntry: showUrlEntry,
      url: '',
      authScheme:null,
      token: '',
      username: '',
      password: '',
      refreshInterval: 0,
      refreshTimerRunning: false,
     });
    if(!showUrlEntry)
    {
      const url = dataset.url;
      this.fetchAndSetDataset(url, dataset, null, null, null);
    }
  }

  onUpload = (file) => {
    this.props.setHierarchyConfig([]);
    this.props.colorBy(null);
    this.props.uploadDataset({ 'owner': this.props.uuid, 'file': file });
    this.props.stopRefresh();
    this.setState({
      selected: null,
      selectedFile: file.name,
      refreshInterval: 0,
      refreshTimerRunning: false,
    });
  }

  onUrlChange = (evt) => {
    this.setState({ url: evt.target.value });
  }

  onTokenChange = (evt) => {
    this.setState({ token: evt.target.value });
  }

  onUsernameChange = (evt) => {
    this.setState({ username: evt.target.value });
  }

  onPasswordChange = (evt) => {
    this.setState({ password: evt.target.value });
  }

  onUrlOk = () => {
    this.setState({ showUrlEntry: false });
    const dataset = CUSTOM_DATASET;
    if(!isNil(this.state.url))
    {
      const url = this.state.url;
      dataset.url = url;
      this.fetchAndSetDataset(url, dataset, this.state.username, this.state.password, this.state.token);
    }
  }

  onUrlCancel = () => {
    this.setState({ 
      showUrlEntry: false,
      url: '',
      authScheme:'',
      token: '',
      username: '',
      password: '',
     });
  }

  getDownloadUrl = () => {
    const urlObject = window.URL || window.webkitURL || window;
    const json = JSON.stringify({'dataset': this.props.dataset});
    const blob = new Blob([json], {'type': "application/json"});
    const url = urlObject.createObjectURL(blob);;
    return url;
  }

  onRefresh = () =>{
    const url = this.state.selected.url;
    const dataset = this.state.selected;
    this.fetchAndSetDataset(url, dataset, this.state.username, this.state.password, this.state.token);
  }

  onTimedRefreshStart = () =>{
    this.props.setIsFetching({'owner': this.props.uuid, 'isFetching': true});
    this.setState({
      'refreshTimerRunning': true
    });
    const authHeader = buildAuthHeader(this.state.username, this.state.password, this.state.token);
    const url = this.state.selected.url;
    const interval = this.state.refreshInterval;
    this.props.startRefresh({'owner': this.props.uuid,'url': url, 'header': authHeader, 'interval': interval});
  }

  onTimedRefreshStop = () =>{
    this.setState({
      'refreshTimerRunning': false
    });
    this.props.stopRefresh();
  }

  onTimedRefreshIntervalChanged = (interval) =>{
    const numInt = parseInt(interval, 10);
    if(!isNaN(numInt)){
      this.setState({
        refreshInterval: numInt,
      });
    }
  }

  render() {
    if (port === '80') {
      POSEIDON_DATASET = {name:"",url:""};
    }
    const canDownload = this.state.selected && !this.state.selectedFile;
    const canRefresh = this.state.selected && !isNil(this.state.selected.url)
    return (
      <div className={style.dataControls}>
        <div className={style.selectorContainer}>
          <span className={style.label}>Dataset</span>
          <DatasetSelector
            className={style.selector}
            selected={this.state.selected}
            onChange={this.onSelected}
            datasets={[...this.props.datasets, POSEIDON_DATASET, CUSTOM_DATASET]}
          />
        </div>

        <div className={style.uploadContainer}>
          <span className={style.label}>Upload</span>
          <DatasetUpload
            ownerUuid={this.props.uuid}
            className={style.fileUpload}
            selected={this.state.selectedFile}
            onChange={this.onUpload}
          />
        </div>

          <div className={style.utilityContainer}>
          { canDownload &&
            <DatasetDownload
              className={style.fileDownload}
              selected={this.state.selected.name}
              url={this.getDownloadUrl()}
              disabled={this.props.isFetching}
            />
          }
          { canRefresh &&
            <div className={style.urlRefreshContainer}>
              <DatasetRefresh
                className={style.urlRefresh}
                onClick={this.onRefresh}
                disabled={this.props.isFetching}
              />
              <DatasetTimedRefresh
                className={style.urlRefresh}
                interval={this.state.refreshInterval}
                timerIsRunning={this.state.refreshTimerRunning}
                disabled={this.props.isFetching}
                onIntervalChange={this.onTimedRefreshIntervalChanged}
                onStartClick={this.onTimedRefreshStart}
                onStopClick={this.onTimedRefreshStop}
              />
            </div>
          }
          </div>
          <div className={style.urlRefreshTime}>
            { canRefresh && this.props.isFetching &&
              <span>
                <FontAwesomeIcon className="fa-spin" icon={faCog} /> Fetching Data...
              </span>
            }
            { canRefresh && !this.props.isFetching &&
              <span>
                Last Updated: { this.props.lastUpdated ? (this.props.lastUpdated.toLocaleDateString() || "") + " " + (this.props.lastUpdated.toLocaleTimeString() || "") : "Never" }
              </span>
            }
          </div>
          <Modal isOpen={ this.state.showUrlEntry } onRequestClose={this.onUrlCancel} contentLabel="Enter a Url">
            <div className={ style.modal }>
              <div className={ style.modalMain }>
                <span>
                  <label> URL </label>
                  <input type="text" value={this.state.url} onChange={ this.onUrlChange }/>
                </span>
                <span>
                  <label> AuthType </label>
                  <select
                    onChange={(evt) => this.setState({ authScheme: evt.target.value })}
                    value={isNil(this.state.authScheme) ? '' : this.state.authScheme}
                  >
                    {authTypes.map((at) => {
                      return (
                        <option key={at.scheme} value={at.scheme}>
                          {at.name}
                        </option>
                      );
                    })}
                  </select>
                </span>
                { this.state.authScheme === 'Bearer' &&
                  <span>
                    <label> Token </label>
                    <input type="text" value={this.state.Token} onChange={ this.onTokenChange }/>
                  </span> 
                }
                { this.state.authScheme === 'Basic' &&
                  <div>
                    <span>
                      <label> Username </label>
                      <input type="text" value={this.state.userName} onChange={ this.onUsernameChange }/>
                    </span>
                    <span>
                      <label> Password </label>
                      <input type="password" value={this.state.password} onChange={ this.onPasswordChange }/>
                    </span>
                  </div>
                }
                <div>
                  <span className={ style.centerSpan }>
                    <div className="button circular" title="Ok" onClick={this.onUrlOk}>
                        <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div className="button circular" title="Cancel" onClick={this.onUrlCancel}>
                        <FontAwesomeIcon icon={faTimes} />
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

const toURL = (url) => {
  try {
    return new URL(url)
  } catch(error) {
    if (error instanceof TypeError) {
      return null;
    } else {
      throw error;
    }
  }
}

DatasetControls.defaultProps = {
  uuid: uuidv4(),
  datasets: [],
  dataset: null,
  isFetching: false,
  lastUpdated: new Date(),
};

DatasetControls.propTypes = {
  uuid: PropTypes.string,
  datasets: PropTypes.array,
  dataset: PropTypes.array,
  fetchDataset: PropTypes.func.isRequired,
  uploadDataset: PropTypes.func.isRequired,
  setDataset: PropTypes.func.isRequired,
  removeDataset: PropTypes.func.isRequired,
  removeSearchIndex: PropTypes.func.isRequired,
  getIsFetching: PropTypes.func.isRequired,
  setIsFetching: PropTypes.func.isRequired,
  showNodes: PropTypes.func.isRequired,
  setHierarchyConfig: PropTypes.func.isRequired, 
  colorBy: PropTypes.func.isRequired,
  startRefresh: PropTypes.func.isRequired,
  stopRefresh: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  lastUpdated: PropTypes.instanceOf(Date),
  setError: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const owner = ownProps.uuid;
  return {
    dataset: selectDataset(state,owner),
    isFetching: getIsFetching(state, owner),
    lastUpdated: getLastUpdated(state, owner)
  };
}

const mapDispatchToProps = {
  fetchDataset,
  uploadDataset,
  setDataset,
  selectDataset,
  removeDataset,
  removeSearchIndex,
  getIsFetching,
  setIsFetching,
  showNodes,
  setHierarchyConfig, 
  colorBy,
  startRefresh,
  stopRefresh,
  setError
};

export default connect(mapStateToProps, mapDispatchToProps)(DatasetControls);
