import React from "react";
import { connect } from "react-redux";
import { isNil } from "ramda";

import { fetchDataset } from "epics/fetch-dataset-epic";
import { uploadDataset } from "epics/upload-dataset-epic";
import { setDataset } from "domain/dataset";

import DatasetSelector from "./DatasetSelector";
import DatasetUpload from "./DatasetUpload";

import style from "./DatasetControls.module.css";

// Hard coded datasets
const datasets = [
  {
    name: "Small",
    url: "http://52.168.28.25:8080/v1/network/400"
  },
  {
    name: "Medium",
    url: "http://52.168.28.25:8080/v1/network/1400"
  },
  {
    name: "Large",
    url: "http://52.168.28.25:8080/v1/network/4000"
  }
];

class DatasetControls extends React.Component {
  state = {
    selected: null,
    selectedFile: null,
  };

  onSelected = (dataset) => {
    if (isNil(dataset)) {
      this.props.setDataset({ dataset: [], configuration: {} });
      this.setState({
        selected: null,
        selectedFile: null
      });
    } else {
      this.props.fetchDataset(dataset.url);
      this.setState({
        selected: dataset,
        selectedFile: null
      });
    }
  }

  onUpload = (file) => {
    this.props.uploadDataset(file);
    this.setState({
      selected: null,
      selectedFile: file.name
    });
  }

  render() {
    return (
      <div className={ style.dataControls }>
        <div className={ style.selectorContainer }>
          <span className={ style.label }>Dataset</span>
          <DatasetSelector
            className={ style.selector }
            selected={this.state.selected}
            onChange={this.onSelected}
            datasets={datasets}
          />
        </div>

        <div className={ style.uploadContainer }>
          <span className={ style.label }>Upload</span>
          <DatasetUpload
            className={ style.fileUpload }
            selected={ this.state.selectedFile }
            onChange={ this.onUpload }/>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  fetchDataset,
  uploadDataset,
  setDataset
};

export default connect(null, mapDispatchToProps)(DatasetControls);
