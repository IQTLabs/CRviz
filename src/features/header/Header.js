import React from 'react';

import logo from './crlogo.png';
import style from './Header.module.css';

function Header() {
  return (
    <div className={ style.header }>
      <img src={ logo } className={ style.logo } alt='' />
      <span className={ style.appName }>CRviz</span>
      <span className={ style.tagline }>a hierarchical map of network devices</span>
    </div>
  )
}

export default Header;
