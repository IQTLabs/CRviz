import React from "react";
import PropTypes from "prop-types";

import classNames from "classnames";

import { isEmpty, contains, map, sortBy, curry } from "ramda";

import { Droppable } from "react-beautiful-dnd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import AvailableField from "./AvailableField";

function AvailableFieldList({
  style,
  fields,
  values,
  getFieldId,
  droppableId,
  dragState
}) {
  return (
    <Droppable droppableId={droppableId} type="Field">
      {(provided, snapshot) => {
        const dragForeign = isDraggingForeign(dragState, fields, getFieldId);

        return (
          <div
            className={classNames(style.listContainer, {
              [style.dragForeign]: dragForeign,
              [style.isDraggingOver]: snapshot.isDraggingOver
            })}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {!isEmpty(fields) &&
              sortBy(getCount(getFieldId, values), fields).map((field, index) => {
                const id = getFieldId(field);
                const count = values[id].length || 0;
                return (
                  <AvailableField
                    style={style}
                    key={id}
                    draggableId={id}
                    displayName={`${field.displayName} (${count})`}
                    index={index}
                    withPlaceholder={false}
                  />
                );
              })}

            {dragForeign && (
              <div className={style.dragForeignContainer}>
                <span>
                  <FontAwesomeIcon icon={faTrashAlt} />
                </span>
              </div>
            )}
          </div>
        );
      }}
    </Droppable>
  );
}

const getCount = curry((getFieldId, values, field) => {
  return values[getFieldId(field)].length;
});

const isDraggingForeign = (dragState, fields, getFieldId) => {
  return (
    dragState &&
    dragState.draggableId &&
    !contains(dragState.draggableId, map(getFieldId, fields))
  );
};

AvailableFieldList.defaultProps = {
  fields: []
};

const StyleProps = PropTypes.shape({
  listContainer: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired
});

AvailableFieldList.propTypes = {
  style: StyleProps.isRequired,
  fields: PropTypes.array,
  values: PropTypes.object,
  getFieldId: PropTypes.func.isRequired,
  droppableId: PropTypes.string.isRequired
};

export default AvailableFieldList;
