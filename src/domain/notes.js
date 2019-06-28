import { createAction, handleActions } from "redux-actions";

const defaultState = {
  byId:["1"],
  byHash: {
    id: "1", 
    nodeID:null,
    note: {
      title: 'item 1',
      labels: ['weird','red','interesting'],
      content:"I'm a note!"
    }
  },
};

// ACTIONS
const addNote = createAction("ADD_NOTE");
const removeNote = createAction("REMOVE_NOTE");
const removeAllNotes = createAction("REMOVE_ALL_NOTES");

const addLabel = createAction("ADD_LABEL");
const removeLabel = createAction("REMOVE_LABEL");
const removeAllLabels = createAction("REMOVE_ALL_LABELS");


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
    [removeNote]: (state) => {
     	const noteString = "";
      return { ...state, noteString };
    }
  },
  defaultState
);

// SELECTORS
const getNotes = (state) => state.notes;
const getLabels = (state) => state.notes.notes;

export default reducer;

export { addNote, removeNote, getNotes};