import React from "react";
import { addNote, removeNote, getAllNotes,  } from 'domain/notes';

//Styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faSave } from '@fortawesome/free-solid-svg-icons'
import labelStyle from "./Label.module.css";


///Redux
import { connect } from "react-redux";
import { getPosition, getSelectedDatum } from 'domain/controls';

class TooltipControls extends React.Component {
  constructor(props){
    super(props)
    this.state = this.initialState;
  }

  get initialState(){
    return {
      label:"Labels",
      height:"200px",
      width:"300px",
      position: [200,200],
      currentLabel:"",
      note: {
        id:'',
        note:{
          title: '',
          labels: [],
          content:""
        }
      }
    };
  }

  resetBuilder() {
    this.setState(this.initialState);
  }

  handleChangeTitle = (event) => {
    var note = {...this.state.note}
    note.note.title = event.target.value
    this.setState({note});
  }

  handleChangeContent = (event) => {
    var note = {...this.state.note}
    note.note.content = event.target.value
    this.setState({note});
  }

  handleLabels = (event) => {
    this.setState({currentLabel: event.target.value});
  }
  
  saveNote = async () => {
    try {
      var note = {...this.state.note}
      note.id = await this.props.data.CRVIZ._SEARCH_KEY
      await this.setState({note});

      await this.props.addNote(this.state.note);
      console.log(this.props.notes)
      this.resetBuilder()
    } catch(error){
      alert('No search key')
    }
  }

  removeNote = async () => {
    try {
      var note = {...this.state.note};
      note.id = await this.props.data.CRVIZ._SEARCH_KEY;
      this.props.removeNote(this.state.note);
      this.resetBuilder();
      console.log(this.props.notes)
    } catch(error){
      alert('No note on search key')
    }
  }

  keyPressed = (event) => {
    if (event.key === "Enter") {
      var note = {...this.state.note}
      note.note.labels.push(this.state.currentLabel)
      this.setState({note})
      this.setState({currentLabel:""})
    }
  }

  componentDidUpdate = (prevProps) => {
      if (prevProps.data !== this.props.data) {
        if(this.props.data.fieldValue){
          console.log(this.props.data.fieldValue, this.props.data)
        }
      else{
        console.log(this.props.data);
        var note = {...this.state.note}
        note.id = this.props.data.CRVIZ._SEARCH_KEY
        if (note.id in this.props.notes){          
          this.setState({
            note: this.props.notes[note.id]
          });
        }
        else{
          this.resetBuilder()
        }
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

    const inputStyle = {
      backgroundColor:'inherit',
      border: 'none',
      display: 'inline',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      padding: '0',
      margin: '0',
      width: 'inherit'
    }

    const Labels = ({labels}) => (
      <>
        {labels.map(label => (
          <div className={labelStyle.tag} key={label}>{label}</div>
        ))}
      </>
    );  


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
        {this.props.data && this.props.data.fieldValue &&
          <div>
            <h3>{this.props.data.fieldValue} </h3>
          </div>
        }
        {//typeof (this.props.data.CRVIZ._SEARCH_KEY) !== 'undefined' &&
        <div>
          <div>
            <b><h1><input style={inputStyle} type="text" value={this.state.note.note.title} onChange={this.handleChangeTitle} placeholder="Title"/></h1></b>
            <ul className={labelStyle.tags}>
              <li className={labelStyle.tag}><input className={labelStyle.tagInput} type="text" type="text" value={this.state.currentLabel} onChange={this.handleLabels} onKeyPress={this.keyPressed} placeholder={"+"}/></li>
              <Labels labels={this.state.note.note.labels}/>
            </ul>
          </div>
          <p><input style={inputStyle} type="text" value={this.state.note.note.content} onChange={this.handleChangeContent} placeholder="Take a note..."/></p>
          <div >
            <FontAwesomeIcon style={{color:"#47cf38", margin:"10px"}} icon={faSave} onClick={this.saveNote}/>
            <FontAwesomeIcon style={{color:"#cc0000", margin:"10px"}} icon={faTrashAlt} onClick={this.removeNote} />
          </div>
        </div>
        }
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    position: getPosition(state),
    data: getSelectedDatum(state),
    notes: getAllNotes(state),
  };
};

const mapDispatchToProps = {
  addNote,
  removeNote,
};

export default connect(mapStateToProps,mapDispatchToProps)(TooltipControls);

