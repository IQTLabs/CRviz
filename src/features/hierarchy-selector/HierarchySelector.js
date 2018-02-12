import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { append, compose, differenceWith, eqBy, join, prop } from "ramda";

import { selectConfiguration } from "domain/dataset";
import { setHierarchyConfig, selectControls } from "domain/controls";

import FieldList from "./FieldList";
import NewField from "./NewField";
import style from "./HierarchySelector.module.css";

function HierarchySelector({ configuration, controls, setHierarchyConfig }) {
  if (configuration === null) {
    return null;
  }

  const hierarchyConfig = controls.hierarchyConfig;

  const availableFields = differenceWith(
    eqBy(compose(join("."), prop("path"))),
    configuration.fields,
    hierarchyConfig
  );

  return (
    <div className={style.container}>
      <FieldList fields={hierarchyConfig} onChange={setHierarchyConfig} />

      {
        availableFields.length > 0 &&
          <NewField
            isFirst={hierarchyConfig.length === 0}
            availableFields={availableFields}
            onAdd={(field) => setHierarchyConfig(append(field, hierarchyConfig))}
          />
      }
    </div>
  );
}

HierarchySelector.propTypes = {
  configuration: PropTypes.shape({
    fields: PropTypes.array.isRequired
  }),
  controls: PropTypes.shape({
    hierarchyConfig: PropTypes.array.isRequired
  })
};

const mapStateToProps = (state) => ({
  configuration: selectConfiguration(state),
  controls: selectControls(state)
});

const mapDispatchToProps = {
  setHierarchyConfig
};

export default connect(mapStateToProps, mapDispatchToProps)(HierarchySelector);
