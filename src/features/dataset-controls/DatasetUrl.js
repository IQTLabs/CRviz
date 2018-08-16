import React from "react";
import PropTypes from "prop-types";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faCheck from "@fortawesome/fontawesome-free-solid/faCheck";
import faTimes from "@fortawesome/fontawesome-free-solid/faTimes";

import style from "./DatasetControls.module.css";

function DatasetUrl({ shouldShow, url, logonUrl, userName, password, onOk, onCancel, onUrlChange, onLogonUrlChange, onUsernameChange, onPasswordChange }) {
	const calculatedClass = shouldShow ? style.show : style.hide;
  return (
  	
  );
}


DatasetUrl.propTypes = {
  className: PropTypes.string,
  url: PropTypes.string,
  userName: PropTypes.string,
  password: PropTypes.string
};

export default DatasetUrl;