import React from "react";
import { renderToString } from 'react-dom/server'

import { map, join, path } from "ramda";
import { select, event as d3Event } from "d3-selection";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch,  faTimesCircle} from "@fortawesome/free-solid-svg-icons";

const setupNotes = (content) => {
  let cont = content
  cont += renderToString(<NotesOnViz />)
  return cont
  
};

class NotesOnViz extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    console.log(this.state.value)
    event.preventDefault();
  }

  render() {
    return(
      <div>
        <textarea value={this.state.value} placeholder="Take Notes..." onChange={this.handleChange} />
        <button onClick={this.handleSubmit}>Finish</button>
      </div>
    )
  }
}

export { setupNotes} ;