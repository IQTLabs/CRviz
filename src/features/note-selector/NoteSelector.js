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

  hoverOn (e)  {
    this.setState({ hover: true });
    console.log(this.state.hover)
  }

  hoverOff (e)  { 
    this.setState({ hover: false });    
    console.log(this.state.hover)
  }

  render() {
    return (
      <li
        //onMouseEnter={this.hoverOn}
        //onMouseLeave={this.hoverOff}
        onMouseEnter={this.hoverOn.bind(this)}
        onMouseLeave={this.hoverOff.bind(this)}
        className={style.tag}
      >
        {this.props.note_title}
      </li>
    );
  }
}

class NoteSelectorList extends React.Component {
  render() {
    const Notes = ({notes}) => (
      <>
        {Object.values(notes).map(note => {
          console.log(note)
          return <Note key={`note-${note.id}`} index={note.id} note_title={note.note.title} />;
        })}
      </>
    );

    return (
        <ul className={style.tags}>
            <Notes notes={this.props.notes}/>
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
