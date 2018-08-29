import React from "react";
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt,faStopCircle, faCog } from "@fortawesome/free-solid-svg-icons";

function DatasetRefresh({ className, interval, timerIsRunning, isFetching, onIntervalChange, onStartClick, onStopClick }) {
  return (
    <span className={ className }>
      <input type='text' title="Refresh interval in seconds" value={interval} onChange={(evt) => onIntervalChange(evt.target.value)}/>
      {!timerIsRunning && !isFetching &&
	      <div className="button" title="Start Refresh Timer" onClick={() => onStartClick()}>
	        <FontAwesomeIcon icon={faSyncAlt} />
	      </div>
  	  }
      {isFetching &&
        <div className="button" disabled title="Refreshing...">
          <FontAwesomeIcon className="fa-spin" icon={faCog} />
        </div>
      }
  	  {timerIsRunning && !isFetching &&
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
