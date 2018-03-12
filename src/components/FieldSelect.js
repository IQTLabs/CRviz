import React from "react";
import PropTypes from "prop-types";
import { compose, join, split, find, propEq, prop, isNil } from "ramda";

function FieldSelect({ fields, value, onChange, className, name }) {
  return (
    <select
      className={ className }
      name={ name }
      onChange={(evt) => onChange(stringToField(fields, evt.target.value))}
      value={ isNil(value) ? '' : fieldToString(value)}
    >
      <option value=''>&mdash;</option>
      {fields.map((field) => {
        const key = fieldToString(field);
        return (
          <option key={key} value={key}>
            {field.displayName}
          </option>
        );
      })}
    </select>
  );
}

const FieldShape = PropTypes.shape({ path: PropTypes.array.isRequired, displayName: PropTypes.string.isRequired });

FieldSelect.propTypes = {
  fields: PropTypes.arrayOf(FieldShape).isRequired,
  value: FieldShape,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  name: PropTypes.string,
};

const fieldToString = compose(join("."), prop("path"));
const stringToField = (fields, string) => {
  const path = split(".", string);
  return find(propEq("path", path), fields);
};

export default FieldSelect;
