import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { DragDropContext} from 'react-beautiful-dnd';

import {
  compose,
  differenceWith,
  eqBy,
  equals,
  find,
  findIndex,
  identity,
  insert,
  isEmpty,
  isNil,
  path,
  remove
} from "ramda";

import { 
  selectMergedConfiguration, selectMergedValues, getFieldId, selectDataset,
  setKeyFields, getKeyFields, setIgnoredFields, getIgnoredFields
} from "domain/dataset";
import { diffDataset } from "epics/diff-dataset-epic";

import SelectedFieldList from 'features/drag-drop-utils/SelectedFieldList';
import AvailableFieldList from 'features/drag-drop-utils/AvailableFieldList';
import DropTarget from 'features/drag-drop-utils/DropTarget';

import availableFieldListStyle from 'features/drag-drop-utils/AvailableFieldList.module.css';
import selectedFieldListStyle from 'features/drag-drop-utils/SelectedFieldList.module.css';

const KEY_FIELD_LIST_ID = 'KeyFieldList';
const IGNORED_FIELD_LIST_ID = 'IgnoredFieldList';
const AVAILABLE_FIELD_LIST_ID = 'AvailableFieldList';
const KEY_TARGET_ID = 'KeyTarget';
const IGNORED_TARGET_ID = 'IgnoredTarget';

class ComparisonSelector extends React.Component {

  state = {
    dragState: null
  }

  onDragStart = (dragStart) => {
    this.setState({
      dragState: dragStart
    });
  }

  onDragUpdate = (dragUpdate) => {
    this.setState({
      dragState: dragUpdate
    })
  }

  onDragEnd = (dropResult) => {
    const { draggableId, destination } = dropResult;
    this.setState({ dragState: null })

    if (destination === null) {
      return;
    } else if (destination.droppableId === KEY_FIELD_LIST_ID) {
      this.updateKeyFields(draggableId, destination.index)
    } else if (destination.droppableId === (KEY_TARGET_ID)) {
      this.updateKeyFields(draggableId, this.props.keyFields.length);
    } else if (destination.droppableId === IGNORED_FIELD_LIST_ID) {
      this.updateIgnoreFields(draggableId, destination.index)
    } else if (destination.droppableId === (IGNORED_TARGET_ID)) {
      this.updateIgnoreFields(draggableId, this.props.ignoredFields.length);
    } else {
      this.removeField(draggableId);
    }
  }

  getUpdatedFields = (fieldId, newIndex, fieldsToUpdate) =>{
  	const { fields } = this.props.configuration;

  	const index = findFieldIndex(fieldsToUpdate, fieldId);
    if (index === newIndex) { return; }

    const hasId = (id) => (field) => getFieldId(field) === id;
    const field = find(hasId(fieldId), fields)

    const removeOld = isNil(index) ? identity : remove(index, 1);
    const addNew = insert(newIndex, field);
    const updatedFields = compose(addNew, removeOld)(fieldsToUpdate);

    return updatedFields;
  }

  updateKeyFields = (fieldId, newIndex) =>{
    const keyFields = this.props.keyFields;
    const ignoredFields = this.props.ignoredFields;

    const updatedKeys = this.getUpdatedFields(fieldId, newIndex, keyFields);
    
    if(updatedKeys){
    	this.props.setKeyFields(updatedKeys);
      this.updateDiff(updatedKeys, ignoredFields);
    }
  }

  updateIgnoreFields = (fieldId, newIndex) =>{
    const keyFields = this.props.keyFields;
    const ignoredFields = this.props.ignoredFields;

    const updatedIgnored = this.getUpdatedFields(fieldId, newIndex, ignoredFields);

    if(updatedIgnored){
    	this.props.setIgnoredFields(updatedIgnored);
      this.updateDiff(keyFields, updatedIgnored);
	  }
  }

  removeField = (fieldId) => {
    const keyFields = this.props.keyFields;
    const keyIndex = findFieldIndex(keyFields, fieldId);

    const ignoredFields = this.props.ignoredFields;
    const ignoredIndex = findFieldIndex(ignoredFields, fieldId);

    let updatedKeys = null;
    let updatedIgnored = null;

    if (keyIndex !== null) {
      updatedKeys = remove(keyIndex, 1, keyFields );
      this.props.setKeyFields(updatedKeys);
    }

    if (ignoredIndex !== null) {
      updatedIgnored = remove(ignoredIndex, 1, ignoredFields );
      this.props.setIgnoredFields(updatedIgnored);      
    }

    if(updatedKeys || updatedIgnored){
      this.updateDiff(updatedKeys || keyFields, updatedIgnored || ignoredFields);
    }
  }

  updateDiff = (keyFields, ignoredFields) => {
    const toDiff ={
      'start': {
        'owner': this.props.startUuid,
        'dataset': this.props.start
      },
      'end':{
        'owner': this.props.endUuid,
        'dataset': this.props.end
      },
      'configuration': this.props.configuration,
      'key': keyFields,
      'ignore': ignoredFields,
    }

    this.props.diffDataset(toDiff);
  }

  render() {
    if (this.props.configuration === null) {
      return null;
    }

    const keyFields = this.props.keyFields;
    const ignoredFields = this.props.ignoredFields;
    const usedFields = keyFields.concat(ignoredFields);

    if (isEmpty(this.props.configuration.fields)) {
      return null;
    }

    const availableFields = differenceWith(
      eqBy(getFieldId),
      this.props.configuration.fields.filter((f) => f.groupable),
      usedFields
    );

    const values = this.props.values;

    const dragState = this.state.dragState;

    return (
      <div>
        <DragDropContext
          onDragStart={ this.onDragStart }
          onDragUpdate={ this.onDragUpdate }
          onDragEnd={ this.onDragEnd }>

          <div style={{ marginBottom: '2rem' }}>
            <SelectedFieldList
              style={ selectedFieldListStyle }
              initialItemText="Key On"
              subsequentItemText="And"
              fields={ keyFields }
              values={ values }
              droppableId={ KEY_FIELD_LIST_ID }
              getFieldId={ getFieldId }
              dragState={ dragState }
            />

          <DropTarget
            style={ selectedFieldListStyle }
            initialItemText="Key On"
              subsequentItemText="And"
            isDropDisabled={ path(['source', 'droppableId'], dragState) === KEY_FIELD_LIST_ID }
            droppableId= { KEY_TARGET_ID }
            fields={ this.props.keyFields }
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
            <SelectedFieldList
              style={ selectedFieldListStyle }
              initialItemText="Ignore"
              subsequentItemText="And"
              fields={ ignoredFields }
              values={ values }
              droppableId={ IGNORED_FIELD_LIST_ID }
              getFieldId={ getFieldId }
              dragState={ dragState }
            />

          <DropTarget
            style={ selectedFieldListStyle }
            initialItemText="Ignore"
            subsequentItemText="And"
            isDropDisabled={ path(['source', 'droppableId'], dragState) === IGNORED_FIELD_LIST_ID }
            droppableId= { IGNORED_TARGET_ID }
            fields={ this.props.ignoredFields }
          />
        </div>

          <AvailableFieldList
            style={ availableFieldListStyle }
            fields={ availableFields }
            values={ values }
            droppableId={ AVAILABLE_FIELD_LIST_ID }
            getFieldId={ getFieldId }
            dragState={ this.state.dragState }
          />

        </DragDropContext>
      </div>
    );
  }
}

ComparisonSelector.propTypes = {
  startUuid: PropTypes.string,
  start: PropTypes.array,
  endUuid: PropTypes.string,
  end: PropTypes.array,
  keyFields: PropTypes.array.isRequired,
  ignoredFields: PropTypes.array.isRequired,
  configuration: PropTypes.shape({
    fields: PropTypes.array.isRequired
  }),
};

const findFieldIndex = (list, fieldId) => {
  const matchId = compose(equals(fieldId), getFieldId)
  const index = findIndex(matchId, list)
  return index === -1 ? null : index;
}

const mapStateToProps = (state, ownProps) => ({
  start: selectDataset(state, ownProps.startUuid),
  end: selectDataset(state, ownProps.endUuid),
  keyFields: getKeyFields(state),
  ignoredFields: getIgnoredFields(state),
  configuration: selectMergedConfiguration(state),
  values: selectMergedValues(state)
});

const mapDispatchToProps = {
  setKeyFields,
  setIgnoredFields,
  diffDataset
};

export default connect(mapStateToProps, mapDispatchToProps)(ComparisonSelector);
