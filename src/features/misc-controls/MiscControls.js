import React from "react";
import { connect } from "react-redux";

import { showNodes, useDarkTheme, colorBy, selectControls } from "domain/controls";
import { selectConfiguration } from "domain/dataset";

import FieldSelect from 'components/FieldSelect';

import style from "./MiscControls.module.css";

function MiscControls({ controls, configuration, showNodes, colorBy }) {
  const fields = configuration.fields;
  return (
    <div className={style.container}>
      <div className={`${style.checkboxContainer} input-group`}>
        <input
          type="checkbox"
          id="show-node-check"
          checked={controls.shouldShowNodes}
          onChange={(evt) => showNodes(evt.target.checked)}
        />
        <label htmlFor="show-node-check" className="switch">
          Show nodes
        </label>
      </div>

      <div className={`${style.checkboxContainer} input-group`}>
        <input
          type="checkbox"
          id="dark-theme-check"
          checked={controls.useDarkTheme}
          onChange={(evt) => useDarkTheme(evt.target.checked)}
        />
        <label htmlFor="dark-theme-check" className="switch">
          Use dark theme
        </label>
      </div>

      <div className={ `input-group ${ style.colorBy }` }>
        <label htmlFor="colorBy">Color by</label>
        <FieldSelect
          className={ style.fieldSelect }
          name="colorBy"
          onChange={ colorBy }
          fields={ fields }
          value={ controls.colorBy } />
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    controls: selectControls(state),
    configuration: selectConfiguration(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showNodes: (shouldShowNodes) => dispatch(showNodes(shouldShowNodes)),
    useDarkTheme: (darkTheme) => dispatch(useDarkTheme(darkTheme)),
    colorBy: (field) => dispatch(colorBy(field))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MiscControls);
