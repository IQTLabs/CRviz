import React from 'react';
import ToolTip from 'react-portal-tooltip'

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faInfo from "@fortawesome/fontawesome-free-solid/faInfoCircle";

import logo from './crlogo.png';
import style from './Header.module.css';

class Header extends React.Component {

	state ={
		showInfo: false
	}

	hideTooltip = () => {
		this.setState({
			showInfo: false
		})
	}

	showTooltip = () =>  {
		this.setState({
			showInfo: true
		})
	}

	render() {
		console.log(process.env);
		return (
			<div className={ style.header }>
			  <img src={ logo } className={ style.logo } alt='' />
			  <span className={ style.appName }>CRviz</span>
			  <span className={ style.infoIcon }>
				<label id="showInfo" onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip}>
			      <FontAwesomeIcon icon={faInfo} />
			    </label>
			    <ToolTip active={this.state.showInfo} position="bottom" parent="#showInfo" tooltipTimeout={250}>
			      <div className={ style.infoPopup }>
			        About CRviz:<br/>
			        Home: <a href="https://www.cyberreboot.org/projects/crviz/">https://www.cyberreboot.org/projects/crviz/</a><br/>
			        Version: { process.env.REACT_APP_VERSION } <br/>
			        Copyright © 2018 In-Q-Tel, Inc.
			      </div>
			    </ToolTip>
	    	  </span>
			</div>
		)
	}
}

export default Header;
