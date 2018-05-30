import React from "react";
import ReactDOM from 'react-dom';

import { connect } from "react-redux";

import { selectDataset, selectConfiguration, getQueryString } from "domain/dataset";
import { selectControls } from "domain/controls";

import d3Viz from './d3-viz';
import styles from './Visualization.module.css';

class Visualization extends React.PureComponent {

  componentDidMount() {
    const el = ReactDOM.findDOMNode(this);
    this.viz = d3Viz(el);
    this.updateFromProps();
  }

  updateFromProps() {
    this.viz.update({
      hierarchyConfig: this.props.controls.hierarchyConfig,
      fields: this.props.configuration.fields,
      showNodes: this.props.controls.shouldShowNodes,
      coloredField: this.props.controls.colorBy,
      data: this.props.dataset,
      queryString: this.props.queryString
    });
  }

  componentDidUpdate() {
    this.updateFromProps();
  }

  render() {
    return <div className={ styles.viz }></div>;
  }
}

const mapStateToProps = (state) => {
  return {
    dataset: selectDataset(state),
    configuration: selectConfiguration(state),
    controls: selectControls(state),
    queryString: getQueryString(state)
  };
};

export default connect(mapStateToProps, null)(Visualization);
