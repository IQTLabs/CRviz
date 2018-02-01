import React from "react";
import PropTypes from "prop-types";

import { map, join, split, find, propEq, isNil, isEmpty } from "ramda";

class NewField extends React.PureComponent {
  state = {
    selected: ""
  };

  handleChange = (e) => {
    const path = split(".", e.target.value);
    const field = find(propEq("path", path), this.props.availableFields);
    console.log(field);
    this.setState({ selected: field });
  };

  onAdd = (e) => {
    if (!isNil(this.state.selected)) {
      this.props.onAdd(this.state.selected);
    }
  }

  render() {
    const { availableFields } = this.props;

    if (isEmpty(availableFields)) {
      return null;
    }

    return (
      <span>
        <select onChange={this.handleChange}>
          <option value=''>&ndash;</option>
          {map((field) => {
            const key = join(".", field.path);
            return (
              <option key={key} value={key}>
                {field.displayName}
              </option>
            );
          }, availableFields)}
        </select>
        <button onClick={ this.onAdd }>Add</button>
      </span>
    );
  }
}

NewField.propTypes = {
  availableFields: PropTypes.array,
  onAdd: PropTypes.func
};

export default NewField;
