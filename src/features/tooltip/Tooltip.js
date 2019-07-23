import React from "react";
import { addNote, removeNote, getNotesIndexedByHash } from 'domain/notes';

//Styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSave, faAngleDoubleDown, faAngleDoubleUp, faAngleDoubleRight, faAngleDoubleLeft} from '@fortawesome/free-solid-svg-icons';
import appStyle from '../../App.module.css';
import tooltipStyle from './Tooltip.module.css';

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
      show: true,
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

  handleShowHide = () => {
    this.setState({
      show: !this.state.show
    });
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

  toggleShowNote = () =>{
    this.setState({
      showNote: !this.state.showNote,
    });
  }
  
  saveNote = async () => {
    try {
      var note = {...this.state.note}
      note.id = await this.props.data.CRVIZ._SEARCH_KEY
      await this.setState({note});

      await this.props.addNote(this.state.note);
      //this.resetBuilder()
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
  
  render() {
    const style = {
      show:{
        display : 'block"',
        position: "fixed",
        top: `${10}px`,
        right: `${10}px`,
        boxShadow: `0 4px 8px 0 rgba(0,0,0,0.2)`,
        transition: `0.3s`,
        borderRadius: `10px`,
        padding: `5px`,
        background: `white`,
        width:"290px"  
      },
      hide:{
        display : 'block"',
        position: "fixed",
        top: `${10}px`,
        right: `${-275}px`,
        boxShadow: `0 4px 8px 0 rgba(0,0,0,0.2)`,
        transition: `0.3s`,
        borderRadius: `10px`,
        padding: `5px`,
        background: `white`,
        width:"290px"  
      }
    }

    const inputStyle = {
      background: 'white',
      display: 'inline',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      padding: '0.5rem 0.75rem',
      width: '80%'
    }

    const showNote = this.state.showNote;


    return (
      <>{this.props.data &&
        <div style={ this.state.show ? style.show : style.hide }>
          {this.props.data && !this.props.data.fieldValue  &&
            <>
              <p>
                {!this.state.show && <div className={tooltipStyle.hidden}><FontAwesomeIcon onClick={this.handleShowHide} icon={faAngleDoubleLeft} /> </div>}{this.state.show && <div className={tooltipStyle.shown}><FontAwesomeIcon onClick={this.handleShowHide} icon={faAngleDoubleRight} /></div>}
              </p>
              <div>
                <p><b>UID: </b>{this.props.data.uid} </p>
                <p><b>MAC: </b>{this.props.data.mac} </p>
                <p><b>rDNS_host: </b>{this.props.data.rDNS_host} </p>
                <p><b>Subnet: </b>{this.props.data.subnet} </p>
                <p><b>IP: </b>{this.props.data.IP} </p>
                <p><b>Record Source: </b>{this.props.data.record.source} </p>
                <p><b>Record Timestamp: </b>{this.props.data.record.timestamp} </p>
                <p><b>Role: </b>{this.props.data.role.role} </p>
                <p><b>rDNS_domain: </b>{this.props.data.rDNS_domain} </p>
                <p><b>OS: </b>{this.props.data.os.os} </p>
                <p><b>OS Confidence: </b>{this.props.data.os.confidence} </p>
                <p><b>Vendor: </b>{this.props.data.vendor} </p>
              </div>
            </>
          }
          {this.props.data && this.props.data.fieldValue &&
            <div>
              <h3>{this.props.data.fieldValue} </h3>
            </div>
          }
          <p className={appStyle.accordionHeader} onClick={this.toggleShowNote}>
            Notes {!showNote && <FontAwesomeIcon icon={faAngleDoubleDown} />}{showNote && <FontAwesomeIcon  onClick={this.toggleShowNote} icon={faAngleDoubleUp} />}
          </p>
          
          {showNote === true &&
          <div>
            <div>
              <b><h1><input style={inputStyle} type="text" value={this.state.note.note.title} onChange={this.handleChangeTitle} placeholder="Title"/></h1></b>
            </div>
            <p><textarea style={inputStyle} type="text" value={this.state.note.note.content} onChange={this.handleChangeContent} placeholder="Take a note..."/></p>
            <div style={{textAlign:"center"}}>
              <label className="button circular">
                <FontAwesomeIcon style={{margin:"2.5px"}} icon={faSave} onClick={this.saveNote}/>
              </label>
              <label className="button circular">
                <FontAwesomeIcon style={{margin:"2.5px"}} icon={faTrashAlt} onClick={this.removeNote} />
              </label>
            </div>
          </div>
          }
        </div>}
      </>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    position: getPosition(state),
    data: getSelectedDatum(state),
    notes: getNotesIndexedByHash(state),
  };
};

const mapDispatchToProps = {
  addNote,
  removeNote,
};

export default connect(mapStateToProps,mapDispatchToProps)(TooltipControls);

