import React from "react";
import PropTypes from "prop-types";
import { isNil, find, propEq } from "ramda";

function DatasetSelector({ className, selected, datasets, onChange }) {
  return (
    <div className={className}>
      <select
        onChange={(evt) => onChange(find(eqUrl(evt.target.value), datasets)) }
        value={isNil(selected) ? "" : selected.url}
      >
        <option value="">&mdash;</option>
        {datasets.map((dataset) => {
          return (
            <option key={dataset.url} value={dataset.url}>
              {dataset.name}
            </option>
          );
        })}
      </select>
    </div>
  );
}

const eqUrl = propEq("url");

const PropTypesDataset = PropTypes.shape({
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
});

DatasetSelector.propTypes = {
  className: PropTypes.string,
  selected: PropTypesDataset,
  datasets: PropTypes.arrayOf(PropTypesDataset).isRequired,
  onChange: PropTypes.func.isRequired
};

export default DatasetSelector;
