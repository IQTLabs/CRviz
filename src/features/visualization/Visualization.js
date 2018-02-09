import React from "react";
import ReactDOM from 'react-dom';

import { connect } from "react-redux";

import { selectDataset, selectConfiguration } from "domain/dataset";
import { selectControls } from "domain/controls";

import d3Viz from './d3-viz';

class Visualization extends React.PureComponent {

  componentDidMount() {
    const el = ReactDOM.findDOMNode(this);
    this.viz = d3Viz(el);
    this.updateFromProps();
  }

  updateFromProps() {
    this.viz.update({
      x: this.props.x,
      y: this.props.y,
      r: this.props.r
    });
  }

  componentDidUpdate() {
    this.updateFromProps();
  }

  render() {
    return <div style={{ width: '100%', height: '100%' }}></div>;
  }
}

const mapStateToProps = (state) => {
  return {
    dataset: selectDataset(state),
    configuration: selectConfiguration(state),
    controls: selectControls(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Visualization);
