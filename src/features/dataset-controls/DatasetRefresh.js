import React from "react";
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedoAlt } from "@fortawesome/free-solid-svg-icons/faRedoAlt";

function DatasetRefresh({ className, onClick }) {
  return (
    <span className={ className }>
      <div className="button" title="Refresh" onClick={() => onClick()}>
        <FontAwesomeIcon icon={faRedoAlt} />
      </div>
    </span>
  );
}

DatasetRefresh.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired
};

export default DatasetRefresh;
