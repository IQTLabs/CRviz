import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { isNil } from "ramda";

import { fetchDataset } from "epics/fetch-dataset-epic";
import { uploadDataset } from "epics/upload-dataset-epic";
import { setDataset } from "domain/dataset";

import DatasetSelector from "./DatasetSelector";
import DatasetUpload from "./DatasetUpload";

import style from "./DatasetControls.module.css";

const CUSTOM_DATASET = {
  name: "Custom URL",
  url: "custom-url"
};

var host = window.location.host;
var hostname = window.location.hostname;
var port = '80';
if (host.indexOf(':') > -1) {
  port = String(parseInt(host.split(":")[1])-1);
}

var POSEIDON_DATASET = {
  name: "Poseidon Network",
  url: "http://"+hostname+":"+port+"/v1/network"
};

class DatasetControls extends React.Component {

  state = {
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

  onSelected = (dataset) => {
    if (isNil(dataset)) {
      return this.resetDataset();
    }

    const message = "Please enter a URL";
    const url = dataset === CUSTOM_DATASET ? prompt(message) : dataset.url;
    if (toURL(url)) {
      this.props.fetchDataset(url);
      this.setState({
        selected: dataset,
        selectedFile: null
      });
    } else {
      alert("Please enter a valid URL.");
    }
  };

  onUpload = (file) => {
    this.props.uploadDataset(file);
    this.setState({
      selected: null,
      selectedFile: file.name
    });
  };

  render() {
    if (port !== '80') {
      POSEIDON_DATASET = {name:"",url:""};
    }
    return (
      <div className={style.dataControls}>
        <div className={style.selectorContainer}>
          <span className={style.label}>Dataset</span>
          <DatasetSelector
            className={style.selector}
            selected={this.state.selected}
            onChange={this.onSelected}
            datasets={[...this.props.datasets, CUSTOM_DATASET]}
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
  datasets: []
};

DatasetControls.propTypes = {
  datasets: PropTypes.array,
  fetchDataset: PropTypes.func.isRequired,
  uploadDataset: PropTypes.func.isRequired,
  setDataset: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  fetchDataset,
  uploadDataset,
  setDataset
};

export default connect(null, mapDispatchToProps)(DatasetControls);
