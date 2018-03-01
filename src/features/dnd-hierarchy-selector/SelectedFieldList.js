import React from 'react';
import PropTypes from "prop-types";

import { Droppable } from 'react-beautiful-dnd';

import { isEmpty } from 'ramda';

import SelectedField  from './SelectedField';

class SelectedFieldList extends React.Component {
  render() {
    const { fields, getFieldId } = this.props;

    return (
      <Droppable droppableId={ this.props.droppableId } type='Field' >
        {
          (provided, snapshot) => {
            return (
              <div
                style={{ paddingBottom: '2rem' }}
                ref={ provided.innerRef } { ...provided.droppableProps }>
                {
                  !isEmpty(fields) && fields.map((field, index) =>
                    <SelectedField
                      draggableId={ getFieldId(field) }
                      key={ field.path }
                      field={ field }
                      index={ index } />
                  )
                }
                {
                  isEmpty(fields) &&
                    <div style={{ height: '2rem' }}>
                      Drop here!
                    </div>
                }
                { provided.placeholder }
              </div>
            );
          }
        }
      </Droppable>
    );
  }
}

SelectedFieldList.defaultProps = {
  fields: []
};

SelectedFieldList.propTypes = {
  fields: PropTypes.array,
  droppableId: PropTypes.string.isRequired,
  getFieldId: PropTypes.func.isRequired,
};

export default SelectedFieldList;
