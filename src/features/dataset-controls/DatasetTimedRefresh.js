import React from "react";
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt,faStopCircle } from "@fortawesome/free-solid-svg-icons";

function DatasetTimedRefresh({ className, interval, timerIsRunning, disabled, onIntervalChange, onStartClick, onStopClick }) {
  return (
    <span className={ className }>
      <input type='text' title="Refresh interval in seconds" value={interval} onChange={(evt) => onIntervalChange(evt.target.value)}/>
      {!timerIsRunning && 
	      <div className="button" disabled={disabled} title="Start Refresh Timer" onClick={() => onStartClick()}>
	        <FontAwesomeIcon icon={faSyncAlt} />
	      </div>
  	  }
  	  {timerIsRunning && 
	      <div className="button" disabled={disabled} title="Stop Refresh Timer" onClick={() => onStopClick()}>
	        <FontAwesomeIcon icon={faStopCircle} />
	      </div>
  	  }
    </span>
  );
}

DatasetTimedRefresh.propTypes = {
  className: PropTypes.string,
  interval: PropTypes.number,
  timerIsRunning: PropTypes.bool,
  onIntervalChange: PropTypes.func.isRequired,
  onStartClick: PropTypes.func.isRequired,
  onStopClick: PropTypes.func.isRequired
};

export default DatasetTimedRefresh;
