import React from 'react';
import PropTypes from 'prop-types';

import classNames from "classnames";
import { Droppable } from "react-beautiful-dnd";

/**
 * Droppable component to use as a dummy drop target next to SelectedFieldList.
 * This droppable doesn't contain any draggable.
 *
 * Note: this cannot be used nested inside SelectedFieldList, because they need
 * to accept the same type, and react-beautiful-dnd doesn't allow that.
 */
function DropTarget({ style, initialItemText, subsequentItemText, droppableId, isDropDisabled, fields }) {
  return (
    <div
      className={classNames({
        [style.listContainer]: true,
        [style.isDropDisabled]: isDropDisabled
        })}>
      <div className={style.draggable}>
        <div className={style.field}>
          <span className={style.groupBy}>
            { fields.length === 0 ? initialItemText : subsequentItemText }
          </span>

          <Droppable
            isDropDisabled={ isDropDisabled }
            droppableId={droppableId}
            type="Field">

            {(provided, snapshot) => {
              return (
                <span
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={
                    classNames({
                      [style.dropTarget]: true,
                      [style.isDraggingOver]: snapshot.isDraggingOver
                    })}
                >
                    Drop attribute here
                </span>
              )
            }}
          </Droppable>
        </div>
      </div>
    </div>
  );
}

DropTarget.propTypes = {
  style: PropTypes.shape({
    isDropDisabled: PropTypes.string.isRequired,
    dropTarget: PropTypes.string.isRequired,
    isDraggingOver: PropTypes.string.isRequired,

    // The classes below should be identical to the styling of SelectedFieldList
    // to make both layout the same.
    listContainer: PropTypes.string.isRequired,
    draggable: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    groupBy: PropTypes.string.isRequired,
  }),

  droppableId: PropTypes.string.isRequired,
  isDropDisabled: PropTypes.bool.isRequired,
  fields: PropTypes.array.isRequired
}


export default DropTarget;
