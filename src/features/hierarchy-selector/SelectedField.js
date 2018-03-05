import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import classNames from 'classnames';

function SelectedField({ style, displayName, index, draggableId, dragIndex, animated }) {
  return (
    <Draggable
      draggableId={ draggableId }
      type='Field'
      index={ index }>
      {
        (provided, snapshot) => {
          return <Field
            style={ style }
            displayName={ displayName }
            dragIndex={ dragIndex }
            provided={ provided }
            animated={ animated }
          />
        }
      }
    </Draggable>
  )
}

function Field({ style, displayName, dragIndex, animated, provided }) {
  return (
    <div>
      <div
        className={style.draggable}
        ref={ provided.innerRef }
        { ...provided.draggableProps }
        { ...provided.dragHandleProps }>
        <div className={style.field}>
          <span className={
              classNames({
                [style.groupBy]: true,
                [style.animated]: animated
              })}>
              { dragIndex === 0 ? 'Group by' : 'Then by' }
            </span>
            <span className={style.fieldName}>
              {displayName}
            </span>
          </div>
        </div>

        { provided.placeholder }
      </div>
  )

}

export default SelectedField;
