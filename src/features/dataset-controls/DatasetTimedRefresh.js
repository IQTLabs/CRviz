import React from "react";
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { faStopCircle } from "@fortawesome/free-solid-svg-icons";

function DatasetRefresh({ className, interval, timerIsRunning, onIntervalChange, onStartClick, onStopClick }) {
  return (
    <span className={ className }>
      <input type='text' value={interval} onChange={(evt) => onIntervalChange(evt.target.value)}/>
      {!timerIsRunning &&
	      <div className="button" title="Start Refresh Timer" onClick={() => onStartClick()}>
	        <FontAwesomeIcon icon={faSyncAlt} />
	      </div>
  	  }
  	  {timerIsRunning &&
	      <div className="button" title="Stop Refresh Timer" onClick={() => onStopClick()}>
	        <FontAwesomeIcon icon={faStopCircle} />
	      </div>
  	  }
    </span>
  );
}

DatasetRefresh.propTypes = {
  className: PropTypes.string,
  interval: PropTypes.number,
  timerIsRunning: PropTypes.bool,
  onIntervalChange: PropTypes.func.isRequired,
  onStartClick: PropTypes.func.isRequired,
  onStopClick: PropTypes.func.isRequired
};

export default DatasetRefresh;
