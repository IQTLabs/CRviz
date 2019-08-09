import React from "react";
import { connect } from "react-redux";

import { 
  getNotesIndexedByHash
} from "domain/notes";

import style from './NoteSelector.module.css';

class Note extends React.Component {
  state = {
    hover: false
  };

  hoverOn = () => {
    this.setState({ hover: true });
  }

  hoverOff = () => { 
    this.setState({ hover: false });    
  }

  render() {
    return (
      <li
     
        onMouseEnter={this.hoverOn}
        onMouseLeave={this.hoverOff}
        className={style.tag}
      >
        {this.props.note_title}
      </li>
    );
  }
}

class NoteSelectorList extends React.Component {
  render() {
    return (
      <ul className={style.tags}>
        {Object.values(this.props.notes).map(note => {
          return <Note key={`note-${note.id}`} index={note.id} note_title={note.note.title} />;
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
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteSelectorList);
