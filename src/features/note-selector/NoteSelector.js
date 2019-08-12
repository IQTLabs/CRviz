import React from "react";
import { connect } from "react-redux";

import { 
  toggleNotesHover,
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

  render() {
    return (
      <li
     
        onMouseEnter={this.props.hoverOn}
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
          return <Note key={`note-${note.id}`} index={note.id} note_title={note.note.title} hoverOn={this.hoverOn} hoverOff={this.hoverOff} />;
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
  toggleNotesHover
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteSelectorList);
