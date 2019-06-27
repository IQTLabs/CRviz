import React from "react";

//Styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTags, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

///Redux
import { connect } from "react-redux";
import { getPosition, getSelectedDatum } from '../../domain/controls';

function contentEditable(WrappedComponent) {
  //https://medium.com/@vraa/inline-edit-using-higher-order-components-in-react-7828687c120c
  return class extends React.Component {

    state = {
      editing: false
    }

    toggleEdit = (e) => {
      e.stopPropagation();
      if (this.state.editing) {
        this.cancel();
      } else {
        this.edit();
      }
    };

    edit = () => {
      this.setState({
        editing: true
      }, () => {
        this.domElm.focus();
      });
    };

    save = () => {
      this.setState({
        editing: false
      }, () => {
        if (this.props.onSave && this.isValueChanged()) {
          console.log('Value is changed', this.domElm.textContent);
        }
      });
    };

    cancel = () => {
      this.setState({
        editing: false
      });
    };

    isValueChanged = () => {
      return this.props.value !== this.domElm.textContent
    };

    handleKeyDown = (e) => {
      const { key } = e;
      switch (key) {
        case 'Enter':
        case 'Escape':
          this.save();
          break;
      }
    };

    render() {
      let editOnClick = true;
      const { editing } = this.state;
      if (this.props.editOnClick !== undefined) {
        editOnClick = this.props.editOnClick;
      }
      return (
        <WrappedComponent
          className={editing ? 'editing' : ''}
          onClick={editOnClick ? this.toggleEdit : undefined}
          contentEditable={editing}
          ref={(domNode) => {
            this.domElm = domNode;
          }}
          onBlur={this.save}
          onKeyDown={this.handleKeyDown}
          {...this.props}
      >
        {this.props.value}
      </WrappedComponent>
      )
    }
  }
}

class TooltipControls extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      title: "Title",
      label:"Labels",
      height:"200px",
      width:"300px",
      position: [200,200],
    }
  }

  handleChange = event => {
    this.setState({ notes: event.target.value });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      if(this.props.data.fieldValue){
        console.log(this.props.data.fieldValue, this.props.data)
      }
      else{
        console.log(this.props.data);
      }
      
    }
  }
  

  render() {
    const style = {
      display : 'block"',
      position: "fixed",
      //top: `${this.props.position[0]}px`,
      //left: `${this.props.position[1]}px`,
      top: `${10}px`,
      right: `${10}px`,
      boxShadow: `0 4px 8px 0 rgba(0,0,0,0.2)`,
      transition: `0.3s`,
      borderRadius: `10px`,
      padding: `5px`,
      background: `white`,      
    }

    let EditableH1 = contentEditable('h1');
    let EditableP = contentEditable('p');


    return (
      <div style={style}>
        {this.props.data && !this.props.data.fieldValue  &&
            <div>
              <h4><b>UID: </b>{this.props.data.uid} </h4>
              <h4><b>MAC: </b>{this.props.data.mac} </h4>
              <h4><b>rDNS_host: </b>{this.props.data.rDNS_host} </h4>
              <h4><b>Subnet: </b>{this.props.data.subnet} </h4>
              <h4><b>IP: </b>{this.props.data.IP} </h4>
              <h4><b>Record Source: </b>{this.props.data.record.source} </h4>
              <h4><b>Record Timestamp: </b>{this.props.data.record.timestamp} </h4>
              <h4><b>Role: </b>{this.props.data.role.role} </h4>
              <h4><b>rDNS_domain: </b>{this.props.data.rDNS_domain} </h4>
              <h4><b>OS: </b>{this.props.data.os.os} </h4>
              <h4><b>OS Confidence: </b>{this.props.data.os.confidence} </h4>
              <h4><b>Vendor: </b>{this.props.data.vendor} </h4>
            </div>
        }
        {this.props.data && this.props.data.fieldValue && //this.props.data.field in this.props.data &&
          <div>
            <h3>{this.props.data.fieldValue} </h3>
          </div>
        }
        <div>
          <div>
            <EditableH1 value="Title"/>
            <h6>{this.state.label}</h6>
          </div>
          <EditableP value="Take a note..."/>
          <div >
            <FontAwesomeIcon style={{margin:"10px"}} icon={faTags} />
            <FontAwesomeIcon style={{color:"#cc0000",margin:"10px"}} icon={faTrashAlt} />
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    position: getPosition(state),
    data: getSelectedDatum(state)
  };
};

export default connect(mapStateToProps)(TooltipControls);

