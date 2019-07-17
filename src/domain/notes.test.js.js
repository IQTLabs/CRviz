import {
  default as notes,
  addNote,
  setNotes,
  removeNote, 
  getAllNotes, 
} from "./notes";
import { combineReducers } from "redux";
import { expect } from "chai"

const reducer = combineReducers({ notes });

describe("Notes reducer", () => {
  
  describe("add and remove notes", () => {
    it("add a note", (done) => {
      const note = {
        id :'TestId',
        note:{
          title: "I'm the Title of a Notes",
          labels: ['label a', 'label b', 'label c'],
          content:" I'm the Content of a note"
        }
      };

      const action = addNote(note);
      const result = reducer({}, action);

      const defaultState = {
        byId:[`TestId`],
        byHash: {
          'TestId': {
            id: "TestId",
            note:{
              title: "I'm the Title of a Notes",
              labels: ['label a', 'label b', 'label c'],
              content:" I'm the Content of a note"
            } 
          }
        }
      };

      expect(getAllNotes(result)).to.deep.equal(defaultState);

      done();
    });

    it("remove a note", (done) => {
      const note = {
        id :'TestId',
        note:{
          title: "I'm the Title of a Notes",
          labels: ['label a', 'label b', 'label c'],
          content:" I'm the Content of a note"
        }
      };

      const emptyState = {
        byId:[],
        byHash: {
        }
      };

      const add_action = addNote(note);

      const remove_action = removeNote(note.id);

      reducer({}, add_action);
      var result = reducer({}, remove_action);

      expect(getAllNotes(result)).to.deep.equal(emptyState);

      done();
    });
  });

  describe("setNotes", () => {
    it("sets the Control tree", (done) => {
      const notes = {
        'byId':[],
        'byHash': {
        }
      }

      const action = setNotes(notes);
      const result = reducer({}, action);

      expect(getAllNotes(result)).to.deep.equal(notes);

      done();
    });
  });

});
