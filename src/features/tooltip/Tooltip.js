import React from "react";
import { path } from "ramda";

//Styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faSave, faAngleDoubleDown, faAngleDoubleUp, faAngleDoubleRight, faAngleDoubleLeft} from '@fortawesome/free-solid-svg-icons';
import appStyle from '../../App.module.css';
import tooltipStyle from './Tooltip.module.css';

///Redux
import { connect } from "react-redux";
import { selectMergedConfiguration } from "domain/dataset";
import { getPosition, getSelectedDatum } from 'domain/controls';
import { addNote, removeNote, getNotesIndexedByHash } from 'domain/notes';

class TooltipControls extends React.Component {
  constructor(props){
    super(props)
    this.state = this.initialState;
    this.state = {
      ...this,
      show:true
    }
  }

  get initialState(){
    return {
      label:"Labels",
      height:"200px",
      width:"300px",
      position: [200,200],
      currentLabel:"",
      showNote: false,
      showDetails: true,
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

  toggleShowDetails = () =>{
    this.setState({
      showDetails: !this.state.showDetails,
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

    const showNote = this.state.showNote;
    const showDetails = this.state.showDetails;

    return (
      <>
      {this.props.data &&
        <div className={ this.state.show ? tooltipStyle.show : tooltipStyle.hide }>
          <div>
            {!this.state.show && <p className={tooltipStyle.hidden}><FontAwesomeIcon onClick={this.handleShowHide} icon={faAngleDoubleLeft} /> </p>}{this.state.show && <p className={tooltipStyle.shown}><FontAwesomeIcon onClick={this.handleShowHide} icon={faAngleDoubleRight} /></p>}
          </div>
          {!this.props.data.fieldValue  &&
            <p className={appStyle.accordionHeader} onClick={this.toggleShowDetails}>
              Details {!showDetails && <FontAwesomeIcon icon={faAngleDoubleDown} />}{showDetails && <FontAwesomeIcon icon={faAngleDoubleUp} />}
            </p>
          }
          {showDetails && this.props.data && !this.props.data.fieldValue  &&
              <div className={ tooltipStyle.detailPanel }>
                {this.props.fields.map((field)=>{
                  return(
                    <p className={ tooltipStyle.detailText }><b>{field.displayName}: </b>{path(field.path, this.props.data)} </p>
                    );
                })}
              </div>
          }
          {this.props.data && this.props.data.fieldValue &&
            <div className={ tooltipStyle.detailPanel }>
              <h3>{this.props.data.fieldValue} </h3>
            </div>
          }
          {!this.props.data.fieldValue  &&
            <p className={appStyle.accordionHeader} onClick={this.toggleShowNote}>
              Notes {!showNote && <FontAwesomeIcon icon={faAngleDoubleDown} />}{showNote && <FontAwesomeIcon  onClick={this.toggleShowNote} icon={faAngleDoubleUp} />}
            </p>
          }
          
          {showNote &&
          <div>
            <b><h1><input className={tooltipStyle.inputStyle} type="text" value={this.state.note.note.title} onChange={this.handleChangeTitle} placeholder="Title"/></h1></b>
            <p><textarea className={tooltipStyle.inputStyle} type="text" value={this.state.note.note.content} onChange={this.handleChangeContent} placeholder="Take a note..."/></p>
            <div style={{textAlign:"center"}}>
              <label className="button circular" onClick={this.saveNote}>
                <FontAwesomeIcon style={{margin:"2.5px"}} icon={faSave} />
              </label>
              <label className="button circular" onClick={this.removeNote}>
                <FontAwesomeIcon style={{margin:"2.5px"}} icon={faTrashAlt}  />
              </label>
            </div>
          </div>
          }
        </div>
        }
      </>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    position: getPosition(state),
    data: getSelectedDatum(state),
    notes: getNotesIndexedByHash(state),
    fields: selectMergedConfiguration(state).fields,
  };
};

const mapDispatchToProps = {
  addNote,
  removeNote,
};

export default connect(mapStateToProps,mapDispatchToProps)(TooltipControls);

