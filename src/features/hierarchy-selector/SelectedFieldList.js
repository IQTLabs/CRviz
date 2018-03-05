import React from "react";
import PropTypes from "prop-types";
import { difference, isEmpty, isNil, path } from "ramda";

import { Droppable } from "react-beautiful-dnd";
import classNames from "classnames";

import SelectedField from "./SelectedField";

class SelectedFieldList extends React.Component {
  state = {
    previousFields: [],
    toAnimate: null
  };

  componentDidMount() {
    this.setState({ previousFields: this.props.fields });
  }

  componentWillReceiveProps(nextProps) {
    const toAnimate = difference(
      nextProps.fields,
      this.state.previousFields
    )[0];
    this.setState({
      previousFields: nextProps.fields,
      toAnimate
    });
  }

  render() {
    const {
      style,
      fields,
      getFieldId,
      droppableId,
      dragState
    } = this.props;

    return (
      <div
        className={classNames(style.listContainer, {
          [style.isDragging]: dragState !== null,
          [style.isEmpty]: isEmpty(fields),
          [style.isDraggingOver]: isDraggingOver(droppableId, dragState)
        })}
      >
        <Droppable droppableId={droppableId} type="Field">
          {(provided, snapshot) => {
            return (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={style.droppable}
              >
                <List
                  style={ style }
                  fields={ fields }
                  getFieldId={ getFieldId }
                  droppableId={ droppableId }
                  dragState={ dragState }
                  toAnimate={ this.state.toAnimate }
                />

                {isEmpty(fields) && (
                  <div className={style.emptyPlaceholder}>
                    <span>Drop attribute here</span>
                  </div>
                )}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </div>
    );
  }
}

function List({ fields, getFieldId, style ,droppableId, dragState, toAnimate }) {
  if (isEmpty(fields)) {
    return null;
  }
  return (
    fields.map((field, index) => {
      const id = getFieldId(field);
      return (
        <SelectedField
          style={style}
          draggableId={id}
          key={id}
          displayName={field.displayName}
          index={index}
          dragIndex={dragIndex(droppableId, dragState, index)}
          animated={field === toAnimate}
        />
      );
    })
  );
}

const isDraggingOver = (droppableId, dragState) => {
  return !isNil(dragState) &&
    path(["destination", "droppableId"], dragState) === droppableId;
}

/**
 * react-beautiful-dnd does not update the component with the new indices during
 * drag, so we'll calculate our own.
 */
const dragIndex = (droppableId, dragState, index) => {
  // Only update the index if something is being dragged over this droppable.
  // const destId = path(["destination", "droppableId"], dragState);
  // if (isNil(destId) || destId !== droppableId) {
  //   return index;
  // }
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

  // For item that is being dragged, the new index is the destination index.
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
  getFieldId: PropTypes.func.isRequired
};

export default SelectedFieldList;
