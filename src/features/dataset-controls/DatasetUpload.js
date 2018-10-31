import React from "react";
import PropTypes from 'prop-types';

import { isNil } from "ramda";

import { FontAwesomeIcon }from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

function DatasetUpload({ className, selected, onChange, ownerUuid }) {
  const inputId = "file-input-" + ownerUuid;
  return (
    <span className={ className }>
      <input
        type="file"
        id={inputId}
        value=''
        style={{'display':'none'}}
        onChange={(evt) => onChange(evt.target.files[0])}
      />

    <span>
      { isNil(selected) ? "No file selected" : selected }
    </span>

      <label htmlFor={inputId} className="button circular" title="Upload data from file">
        <FontAwesomeIcon icon={faUpload} />
      </label>
    </span>
  );
}

DatasetUpload.propTypes = {
  ownerUuid: PropTypes.string.isRequired,
  className: PropTypes.string,
  selected: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default DatasetUpload;
