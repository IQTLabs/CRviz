import { createAction, handleActions } from "redux-actions";

const defaultState = {
  byId:["1"],
  byHash: {
    "1":  {
      id:"1",
      note: { 
        title: 'item 1',
        labels: ['weird','red','interesting'],
        content:"I'm a note!"
      }
    }
  },
};

// ACTIONS
const addNote = createAction("ADD_NOTE");
const removeNote = createAction("REMOVE_NOTE");
const removeAllNotes = createAction("REMOVE_ALL_NOTES");

const addLabel = createAction("ADD_LABEL");
const removeLabel = createAction("REMOVE_LABEL");
//const removeAllLabels = createAction("REMOVE_ALL_LABELS"); //rope this into removeAllNotes


// REDUCERS
const reducer = handleActions(
  {
    [addNote]: (state, { payload }) => {
      return {
        byId: [ ...state.byId, payload.id],
        byHash: {
          ...state.byHash,
          [payload.id]: payload
        }
      }
    },
    [removeNote]: (state, { payload }) => {
      const prunedIds = state.byId.filter(item => {
        return item !== payload.id // return all the items not matching the action.id
      })
      delete state.byHash[payload.id] // delete the hash associated with the action.id
      
      return {
        byId: prunedIds,
        byHash: state.byHash
      }
    }
  },
  defaultState
);

// SELECTORS
const getNotes = (state) => state.notes;
const getLabels = (state) => state.notes.notes;

export default reducer;

export { addNote, removeNote,removeAllNotes, getNotes};

/*
* REFERENCE
* https://hackernoon.com/redux-patterns-add-edit-remove-objects-in-an-array-6ee70cab2456
*/