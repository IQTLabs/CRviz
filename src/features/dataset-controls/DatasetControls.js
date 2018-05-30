import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { isNil } from "ramda";

import { fetchDataset } from "epics/fetch-dataset-epic";
import { uploadDataset } from "epics/upload-dataset-epic";
import { showNodes } from "domain/controls"
import { setDataset, selectDataset } from "domain/dataset";

import DatasetSelector from "./DatasetSelector";
import DatasetUpload from "./DatasetUpload";
import DatasetDownload from "./DatasetDownload";
import DatasetRefresh from "./DatasetRefresh";

import style from "./DatasetControls.module.css";

const CUSTOM_DATASET = {
  name: "Custom URL",
  url: "custom-url"
};

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

class DatasetControls extends React.Component {

  state = {
    dataset: null,
    selected: null,
    selectedFile: null
  };

  resetDataset = () => {
    this.props.setDataset({ dataset: [], configuration: {} });
    this.setState({
      selected: null,
      selectedFile: null
    });
  }

  fetchAndSetDataset = (url, dataset) => {
    if (toURL(url)) {
      this.props.fetchDataset(url);
      this.setState({
        selected: dataset,
        selectedFile: null
      });
    } else {
      alert("Please enter a valid URL.");
    }
  }

  onSelected = (dataset) => {
    if (isNil(dataset)) {
      return this.resetDataset();
    }

    this.props.showNodes(true);

    const message = "Please enter a URL";
    const url = dataset === CUSTOM_DATASET ? prompt(message) : dataset.url;
    dataset.url = url;
    this.fetchAndSetDataset(url, dataset);
  };

  onUpload = (file) => {
    this.props.uploadDataset(file);
    this.setState({
      selected: null,
      selectedFile: file.name
    });
  };

  getDownloadUrl = () => {
    const urlObject = window.URL || window.webkitURL || window;
    const json = JSON.stringify({'dataset': this.props.dataset});
    const blob = new Blob([json], {'type': "application/json"});
    const url = urlObject.createObjectURL(blob);;
    return url;
  };

  onRefresh = () =>{
    const url = this.state.selected.url;
    const dataset = this.state.selected;
    this.fetchAndSetDataset(url, dataset);
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
            />
          }
          { canRefresh &&
            <DatasetRefresh
              className={style.urlRefresh}
              onClick={this.onRefresh}
            />
          }
          </div>

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
  datasets: [],
  dataset: null
};

DatasetControls.propTypes = {
  datasets: PropTypes.array,
  dataset: PropTypes.array,
  fetchDataset: PropTypes.func.isRequired,
  uploadDataset: PropTypes.func.isRequired,
  setDataset: PropTypes.func.isRequired,
  showNodes: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    dataset: selectDataset(state),
  };
}

const mapDispatchToProps = {
  fetchDataset,
  uploadDataset,
  setDataset,
  selectDataset,
  showNodes
};

export default connect(mapStateToProps, mapDispatchToProps)(DatasetControls);
