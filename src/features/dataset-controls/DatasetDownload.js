import React from "react";
import PropTypes from 'prop-types';

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faDownload from "@fortawesome/fontawesome-free-solid/faDownload";

function DatasetDownload({ className, selected, url }) {
  return (
    <span className={ className }>
      <a className="button" href={ url } download={ selected + ".json" }>
        <FontAwesomeIcon icon={faDownload} />
      </a>
    </span>
  );
}

DatasetDownload.propTypes = {
  className: PropTypes.string,
  selected: PropTypes.string,
  url: PropTypes.string
};

export default DatasetDownload;
