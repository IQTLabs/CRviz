import React from "react";
import { connect } from "react-redux";

import {
  append,
  compose,
  differenceWith,
  eqBy,
  join,
  prop
} from "ramda";

import { selectConfiguration } from "domain/dataset";
import { setHierarchy, selectControls } from "domain/controls";

import FieldList from "./FieldList";
import NewField from "./NewField";
import style from "./HierarchySelector.module.css";

function HierarchySelector({ configuration, controls, setHierarchy }) {
  if (configuration === null) {
    return null;
  }

  const hierarchy = controls.hierarchy;

  const availableFields = differenceWith(
    eqBy(compose(join("."), prop("path"))),
    configuration.fields,
    hierarchy
  );

  return (
    <div className={style.container}>

      <FieldList
        fields={ hierarchy }
        onChange={ (newHierarchy) => setHierarchy(newHierarchy) }
      />
      <NewField
        availableFields={availableFields}
        onAdd={(field) => setHierarchy(append(field, hierarchy))}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  configuration: selectConfiguration(state),
  controls: selectControls(state)
});

const mapDispatchToProps = {
  setHierarchy
}

export default connect(mapStateToProps, mapDispatchToProps)(HierarchySelector);
