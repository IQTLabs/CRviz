import React from "react";
import PropTypes from 'prop-types';

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faRedo from "@fortawesome/fontawesome-free-solid/faRedoAlt";

function DatasetRefresh({ className, onClick }) {
  return (
    <span className={ className }>
      <div className="button" title="Refresh" onClick={() => onClick()}>
        <FontAwesomeIcon icon={faRedo} />
      </div>
    </span>
  );
}

DatasetRefresh.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired
};

export default DatasetRefresh;
