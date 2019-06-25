import React from "react";

//Styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTags, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

///Redux
import { connect } from "react-redux";
import { getPosition } from '../../domain/controls';


class TooltipControls extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      title: "Title",
      label:"Labels",
      notes: "Notes...",
      height:"200px",
      width:"300px",
      position: [200,200],
    }
    console.log(props)
  }

  handleChange = event => {
    this.setState({ username: event.target.value });
  };
  

  render() {
    const style = {
      display : 'block"',
      position: "fixed",
      top: `${this.props.position[0]}px`,
      left: `${this.props.position[1]}px`,
      boxShadow: `0 4px 8px 0 rgba(0,0,0,0.2)`,
      transition: `0.3s`,
      borderRadius: `10px`,
      padding: `5px`,
      background: `white`,      
    }
    

    return (
      <div style={style}>
         <div >
              <h1>{this.state.title}</h1>
              <h6>{this.state.label}</h6>
          </div>
         <input
           type="text"
           name="notes"
           placeholder={this.state.Notes}
           value={this.state.username}
           onChange={this.handleChange}
         />
        <div >
          <FontAwesomeIcon onClick={{}} style={{margin:"10px"}} icon={faTags} />
          <FontAwesomeIcon onClick={{}} style={{margin:"10px"}} icon={faTrashAlt} />
        </div>
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

