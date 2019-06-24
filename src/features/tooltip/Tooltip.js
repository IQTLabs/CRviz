import React from "react";
//import ReactDOM from 'react-dom'
//import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getPosition } from '../../domain/controls';

/*import { select, event as d3Event } from "d3-selection";

import * as d3 from 'd3';


import {
  compose,
  differenceWith,
  eqBy,
  equals,
  find,
  findIndex,
  identity,
  insert,
  isEmpty,
  isNil,
  path,
  remove
} from "ramda"; */

class TooltipControls extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      position: [0,0],
    }
    console.log(props)
  }
  

  render() {
    const style = {
      display : 'block"',
      position: "fixed",
      top: `${this.props.position[0]}px`,
      left: `${this.props.position[1]}px`
      //transform:`transform3d(${this.props.x},${this.props.y},0)`
      
    }

    return (
      <div style={style}>
        <div>Data</div>
        <div>Notes</div>
      </div>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    position: getPosition(state)
  };
};

export default connect(mapStateToProps)(TooltipControls);

