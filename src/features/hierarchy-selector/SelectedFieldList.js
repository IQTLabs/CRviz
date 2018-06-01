import React from "react";
import PropTypes from "prop-types";
import { findIndex, eqBy, differenceWith, isEmpty, isNil, path } from "ramda";

import { Droppable } from "react-beautiful-dnd";

import SelectedField from "./SelectedField";

class SelectedFieldList extends React.Component {
  state = {
    lastFields: [],
    toAnimate: null
  };

  componentDidMount() {
    this.setState({
      lastFields: this.props.fields
    });
  }

  static getDerivedStateFromProps(props, state){
    const { getFieldId } = props;

    // Find newly inserted item, if any
    let toAnimate = differenceWith(
      eqBy(getFieldId),
      props.fields,
      state.lastFields
    )[0];

    if (toAnimate) {
      // Only animate item that are not inserted at the bottom using AffordanceDroppable
      const newIndex = findIndex(eqBy(getFieldId, toAnimate), props.fields);
      toAnimate = newIndex < state.lastFields.length ? toAnimate : null;
    }

    return {
      lastFields: props.fields,
      toAnimate: toAnimate
    };
  }

  render() {
    const { style, fields, getFieldId, droppableId, dragState } = this.props;

    const draggingOver = isDraggingOver(droppableId, dragState);
    return (
      <div className={style.listContainer}>
        <Droppable droppableId={droppableId} type="Field">
          {
            (provided, snapshot) => {
            return (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={style.droppable}
              >
                <List
                  style={style}
                  fields={fields}
                  getFieldId={getFieldId}
                  droppableId={droppableId}
                  dragState={dragState}
                  toAnimate={this.state.toAnimate}
                />

                {draggingOver &&
                  dragState.destination.index !== fields.length &&
                  provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </div>
    );
  }
}

function List({
  fields,
  getFieldId,
  style,
  droppableId,
  dragState,
  toAnimate
}) {
  if (isEmpty(fields)) {
    return null;
  }
  return fields.map((field, index) => {
    const id = getFieldId(field);
    const animated = toAnimate && getFieldId(field) === getFieldId(toAnimate);

    return (
      <SelectedField
        style={style}
        draggableId={id}
        key={id}
        displayName={field.displayName}
        index={index}
        dragIndex={dragIndex(droppableId, dragState, index)}
        animated={animated || false}
      />
    );
  });
}

const isDraggingOver = (droppableId, dragState) => {
  return (
    !isNil(dragState) &&
    path(["destination", "droppableId"], dragState) === droppableId
  );
};

/**
 * Calculate the potential indices during drag based on the current dragState.
 *
 * This is used to update the groupBy label on the fly.
 */
const dragIndex = (droppableId, dragState, index) => {
  if (!isDraggingOver(droppableId, dragState)) {
    return index;
  }

  const { source, destination } = dragState;

  const from = source.index;
  const to = destination.index;

  // When inserting, bump down everything below the new index
  if (source.droppableId !== destination.droppableId) {
    return index >= to ? index + 1 : index;
  }

  // For an item that is being dragged, the new index is the destination index.
  if (index === from) {
    return to;
  }
  // Items not between the source and destination indices are not affected
  if (index < Math.min(from, to) || index > Math.max(from, to)) {
    return index;
  }

  if (from < to) {
    // If moving down, bump up everything in between
    return index - 1;
  } else {
    // Otherwise, bump down everything in between
    return index + 1;
  }
};

SelectedFieldList.defaultProps = {
  fields: []
};

SelectedFieldList.propTypes = {
  fields: PropTypes.array,
  droppableId: PropTypes.string.isRequired,
  getFieldId: PropTypes.func.isRequired,

  style: PropTypes.shape({
    listContainer: PropTypes.string.isRequired,
    draggable: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    groupBy: PropTypes.string.isRequired
  })
};

export default SelectedFieldList;
