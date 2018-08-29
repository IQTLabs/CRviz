import React from "react";
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedoAlt, faCog } from "@fortawesome/free-solid-svg-icons";

function DatasetRefresh({ className, onClick, isFetching }) {
  return (
    <span className={ className }>
      {!isFetching &&
      <div className="button" title="Refresh" onClick={() => onClick()}>
        <FontAwesomeIcon icon={faRedoAlt} />
      </div>
  	  }
      {isFetching &&
        <div className="button" disabled title="Refreshing...">
          <FontAwesomeIcon className="fa-spin" icon={faCog} />
        </div>
      }
    </span>
  );
}

DatasetRefresh.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired
};

export default DatasetRefresh;
