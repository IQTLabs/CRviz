import React from "react";
import { connect } from "react-redux";

import { 
  getNotesIndexedByHash
} from "domain/notes";

import style from './NoteSelector.module.css';

class NoteSelector extends React.Component {

  state = {
    
  }

  render() {
    const Notes = ({notes}) => (
      <>
        {Object.values(notes).map(note => (
          <div className={style.tag} key={note.id}>
            {note.note.title}
          </div>
        ))}
      </>
    );

    return (
      <>
        <ul className={style.tags}>
            <Notes notes={this.props.notes}/>
        </ul>
      </>
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

export default connect(mapStateToProps, mapDispatchToProps)(NoteSelector);
