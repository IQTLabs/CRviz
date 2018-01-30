import React from "react";

import { addIndex, map, join, reject, propEq } from "ramda";

function FieldList({ fields, onChange, removeField }) {
  return (
    <ul>
      {addIndex(map)((field, index) => {
        const key = join(".", field.path);
        return (
          <li key={key}>
            <strong>{index === 0 ? "Group" : "Then"} by</strong>{" "}
            {field.displayName}
            <button
              onClick={() =>
                onChange(reject(propEq("path", field.path), fields))
              }
              style={{ float: "right" }}
            >
              x
            </button>
          </li>
        );
      }, fields)}
    </ul>
  );
}

export default FieldList;
