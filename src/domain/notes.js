import { createAction, handleActions } from "redux-actions";

const defaultState = {
  byId:[],
  byHash: {
  }
};

// ACTIONS
const addNote = createAction("ADD_NOTE");
const setNote = createAction("SET_NOTE");
const removeNote = createAction("REMOVE_NOTE");
const replaceAllNotes = createAction("REPLACE_ALL_NOTES");

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
        return item !== payload.id 
      })
      delete state.byHash[payload.id] 
      
      return {
        byId: prunedIds,
        byHash: state.byHash
      }
    },

    [replaceAllNotes]: (state, { payload }) => {
      state = payload
      return {
        state
      }
    },
  },
  defaultState
);

// SELECTORS
const getAllNotes = (state) => state.notes.byHash;
const getNotesStore = (state) => state.notes;


export default reducer;

export { addNote,setNote,removeNote,replaceAllNotes, getAllNotes, getNotesStore};