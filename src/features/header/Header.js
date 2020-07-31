import React from 'react';
import ToolTip from 'react-portal-tooltip'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faTwitter, faMediumM } from "@fortawesome/free-brands-svg-icons";

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
		return (
			<div className={ style.header }>
			  <a href="http://www.cyberreboot.org/" target="_blank" rel="noopener noreferrer">
			  	<img src={ logo } className={ style.logo } alt='Cyber Reboot' />
			  </a>
			  <span className={ style.appName }>CRviz</span>
			  <span className={ style.infoIcon }>
				<label id="showInfo" onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip}>
			      <FontAwesomeIcon icon={faInfoCircle} />
			    </label>
			    <ToolTip active={this.state.showInfo} position="bottom" parent="#showInfo" tooltipTimeout={250}>
			      <div className={ style.infoPopup }>
			        About CRviz:<br/>
			        Home: <a href="https://www.cyberreboot.org/projects/crviz/">https://www.cyberreboot.org/projects/crviz/</a><br/>
			        Version: { process.env.REACT_APP_VERSION } <br/>
			        Copyright © 2017-2019 IQT Labs LLC.
			      </div>
			      <div  className={ style.socialContainer }>
			      	<a href="https://github.com/IQTLabs/" alt="github.com/IQTLabs" target="_blank" rel="noopener noreferrer">
			      		<FontAwesomeIcon color="#7d7d7d" icon={faGithub} />
			      	</a>
			      	<a href="https://twitter.com/_cyberreboot" alt="twitter.com/_cyberreboot" target="_blank" rel="noopener noreferrer">
			      		<FontAwesomeIcon color="#7d7d7d" icon={faTwitter} />
			      	</a>
			      	<a href="https://blog.cyberreboot.org/" alt="blog.cyberreboot.org" target="_blank" rel="noopener noreferrer">
			      		<FontAwesomeIcon color="#7d7d7d" icon={faMediumM} />
			      	</a>
			      </div>
			    </ToolTip>
	    	  </span>
			</div>
		)
	}
}

export default Header;
