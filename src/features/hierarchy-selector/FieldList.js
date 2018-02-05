import React from "react";
import PropTypes from "prop-types";

import {
  addIndex,
  concat,
  join,
  map,
  reduce,
  remove,
  reverse,
  slice
} from "ramda";

import style from "./FieldList.module.css";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faChevronDown from "@fortawesome/fontawesome-free-solid/faChevronDown";
import faChevronUp from "@fortawesome/fontawesome-free-solid/faChevronUp";
import faTimes from "@fortawesome/fontawesome-free-solid/faTimes";

function FieldList({ fields, onChange }) {
  return (
    <ol className={style.fieldList}>
      {addIndex(map)((field, index) => {
        const key = join(".", field.path);
        return (
          <li key={key} className={style.field}>
            <span className={style.description}>
              {index === 0 ? "Group" : "Then"} by
            </span>{" "}
            <span className={style.fieldName} title={field.displayName}>
              {field.displayName}
            </span>
            <span className={style.actions}>
              <button
                onClick={() => onChange(moveUp(fields, index))}
                disabled={index === 0}
              >
                <FontAwesomeIcon icon={faChevronUp} />
              </button>
              <button
                onClick={() => onChange(moveDown(fields, index))}
                disabled={index === fields.length - 1}
              >
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
              <button onClick={() => onChange(removeField(fields, index))}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          </li>
        );
      }, fields)}
    </ol>
  );
}

FieldList.propTypes = {
  fields: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

const moveUp = (list, index) =>
  reduce(
    concat,
    [],
    [
      slice(0, index - 1, list),
      reverse(slice(index - 1, index + 1, list)),
      slice(index + 1, Infinity, list)
    ]
  );

const moveDown = (list, index) =>
  reduce(
    concat,
    [],
    [
      slice(0, index, list),
      reverse(slice(index, index + 2, list)),
      slice(index + 2, Infinity, list)
    ]
  );

const removeField = (list, index) => remove(index, 1, list);

export default FieldList;
