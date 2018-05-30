import React from "react";
import PropTypes from 'prop-types';

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faEye from "@fortawesome/fontawesome-free-solid/faEye";
import faTimes from "@fortawesome/fontawesome-free-solid/faTimes";

function DatasetToolTip({ className, fields, node }) {
  return (
    <span className={ className }>
    {node.datum.isSearchResult &&
      <span className="button" title="Refresh" onClick={() => onClick()}>
        <FontAwesomeIcon icon={faEye} />
      </span>
    }
      <span className="button" title="Close" onClick={() => onClick()}>
        <FontAwesomeIcon icon={faEye} />
      </span>
      <div>
      </div>
    </span>
  );
}

DatasetRefresh.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired
};

export default DatasetToolTip;