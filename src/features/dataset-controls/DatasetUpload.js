import React from "react";
import PropTypes from 'prop-types';

import { isNil } from "ramda";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faUpload from "@fortawesome/fontawesome-free-solid/faUpload";

function DatasetUpload({ className, selected, onChange }) {
  return (
    <span className={ className }>
      <input
        type="file"
        id="file-input"
        value=''
        onChange={(evt) => onChange(evt.target.files[0])}
      />

    <span>
      { isNil(selected) ? "No file selected" : selected }
    </span>

      <label htmlFor="file-input" className="button">
        <FontAwesomeIcon icon={faUpload} />
      </label>
    </span>
  );
}

DatasetUpload.propTypes = {
  className: PropTypes.string,
  selected: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default DatasetUpload;
