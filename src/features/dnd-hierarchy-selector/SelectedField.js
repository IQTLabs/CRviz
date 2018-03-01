import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

function SelectedField({ field, index, draggableId }) {
  return (
    <Draggable
      draggableId={ draggableId }
      type='Field'
      index={ index }>
      {
        (provided, snapshot) => {
          return (
            <div>
              <div
                ref={ provided.innerRef }
                { ...provided.draggableProps }
                { ...provided.dragHandleProps }>
                <span style={{ width: '6rem', display: 'inline-block' }}>
                  { !snapshot.isDragging && (index === 0 ? 'Group by' : 'Then by' ) }
                </span>
                { ' ' }
                { field.displayName }
              </div>

              { provided.placeholder }
            </div>
          )
        }
      }
    </Draggable>
  )
}

export default SelectedField;
