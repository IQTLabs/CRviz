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
    this.state = {
      hover: false
    };
  }

  setHoveredNoteId = () =>{ 
    this.props.hoverMethod(this.props.index);
    this.props.hoverOn();
  }

  render() {
    return (
      <li
     
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
  hoverOn = () => {
    this.props.toggleNotesHover(true);
  }

  hoverOff = () => { 
    this.props.toggleNotesHover(false);  
  }
  render() {
    return (
      <ul className={style.tags}>
        {Object.values(this.props.notes).map(note => {
          return <Note key={`${note.id}`} index={note.id} note_title={note.note.title} hoverOn={this.hoverOn} hoverOff={this.hoverOff} hoverMethod={this.props.setNoteHovered} />;
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
