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

import { selectConfiguration, selectValues, getFieldId } from "domain/dataset";
import { setHierarchyConfig, selectControls, showNodes } from "domain/controls";

import SelectedFieldList from './SelectedFieldList';
import AvailableFieldList from './AvailableFieldList';
import DropTarget from './DropTarget';

import availableFieldListStyle from './AvailableFieldList.module.css';
import selectedFieldListStyle from './SelectedFieldList.module.css';

const SELECTED_FIELD_LIST_ID = 'SelectedFieldList';
const AVAILABLE_FIELD_LIST_ID = 'AvailableFieldList';
const DROP_TARGET_ID = 'DropTarget';

class HierarchySelector extends React.Component {

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
    } else if (destination.droppableId === SELECTED_FIELD_LIST_ID) {
      this.updateHierarchy(draggableId, destination.index)
    } else if (destination.droppableId === (DROP_TARGET_ID)) {
      this.updateHierarchy(draggableId, this.props.controls.hierarchyConfig.length);
    } else {
      this.removeField(draggableId);
    }
  }

  updateHierarchy = (fieldId, newIndex) => {
    const { fields } = this.props.configuration;
    const { hierarchyConfig } = this.props.controls;

    const index = findFieldIndex(hierarchyConfig, fieldId);
    if (index === newIndex) { return; }

    const hasId = (id) => (field) => getFieldId(field) === id;
    const field = find(hasId(fieldId), fields)

    const removeOld = isNil(index) ? identity : remove(index, 1);
    const addNew = insert(newIndex, field);
    const updatedHierarchy = compose(addNew, removeOld)(hierarchyConfig)

    this.props.setHierarchyConfig(updatedHierarchy)
  }

  removeField = (fieldId) => {
    const { hierarchyConfig } = this.props.controls;
    const { setHierarchyConfig } = this.props;
    const index = findFieldIndex(hierarchyConfig, fieldId);

    if (index !== null) {
      setHierarchyConfig(remove(index, 1, hierarchyConfig ))
    }

    if(this.props.controls.hierarchyConfig.length === 0 ){
      this.props.showNodes(true);
    }
  }

  render() {
    if (this.props.configuration === null) {
      return null;
    }

    const hierarchyConfig = this.props.controls.hierarchyConfig;

    if (isEmpty(this.props.configuration.fields)) {
      return null;
    }

    const availableFields = differenceWith(
      eqBy(getFieldId),
      this.props.configuration.fields.filter((f) => f.groupable),
      hierarchyConfig
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
              fields={ hierarchyConfig }
              droppableId={ SELECTED_FIELD_LIST_ID }
              getFieldId={ getFieldId }
              dragState={ dragState }
            />

          <DropTarget
            style={ selectedFieldListStyle }
            isDropDisabled={ path(['source', 'droppableId'], dragState) === SELECTED_FIELD_LIST_ID }
            droppableId= { DROP_TARGET_ID }
            fields={ this.props.controls.hierarchyConfig }
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

HierarchySelector.propTypes = {
  configuration: PropTypes.shape({
    fields: PropTypes.array.isRequired
  }),
  controls: PropTypes.shape({
    hierarchyConfig: PropTypes.array.isRequired
  }),
  showNodes: PropTypes.func.isRequired
};

const findFieldIndex = (list, fieldId) => {
  const matchId = compose(equals(fieldId), getFieldId)
  const index = findIndex(matchId, list)
  return index === -1 ? null : index;
}

const mapStateToProps = (state) => ({
  configuration: selectConfiguration(state),
  values: selectValues(state),
  controls: selectControls(state)
});

const mapDispatchToProps = {
  setHierarchyConfig,
  showNodes
};

export default connect(mapStateToProps, mapDispatchToProps)(HierarchySelector);
