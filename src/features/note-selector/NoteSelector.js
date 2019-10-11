import React from "react";
import { connect } from "react-redux";

import { 
  toggleNotesHover,
  setNoteHovered,
  getNotesIndexedByHash
} from "domain/notes";

import style from './NoteSelector.module.css';

class Note extends React.Component {
  constructor(props){
    super(props);
    this.clicked = false;
    this.state = {
      hover: false
    };
  }

  setHoveredNoteId = () =>{ 
    this.props.hoverMethod(this.props.index);
    this.props.hoverOn();
  }

  setClickedNoteId = () =>{
    this.props.hoverMethod(this.props.index);
    this.props.clickedOn();
  }

  render() {
    return (
      <li
        onClick={this.setClickedNoteId}
        onMouseEnter={this.setHoveredNoteId}
        onMouseLeave={this.props.hoverOff}
        className={style.tag}
      >
        {this.props.note_title}
      </li>
    );
  }
}

class NoteSelectorList extends React.Component {
  clickedOn = () => {
    if (this.clicked == false) {
      this.props.toggleNotesHover(false);
      this.clicked = true;
    } else {
      this.props.toggleNotesHover(true);
      this.clicked = false;
    }
  }

  hoverOn = () => {
    this.props.toggleNotesHover(true);
  }

  hoverOff = () => {
    if(this.clicked == true) {
      this.props.toggleNotesHover(true);
    } else {
      this.props.toggleNotesHover(false);
    }
  }
  render() {
    return (
      <ul className={style.tags}>
        {Object.values(this.props.notes).map(note => {
          return <Note key={`${note.id}`} index={note.id} clicked={this.clicked} note_title={note.note.title} clickedOn={this.clickedOn} hoverOn={this.hoverOn} hoverOff={this.hoverOff} hoverMethod={this.props.setNoteHovered} />;
        })}
      </ul>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notes: getNotesIndexedByHash(state)
  }
};

const mapDispatchToProps = {
  toggleNotesHover,
  setNoteHovered
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteSelectorList);
