import React from "react";
const Popper = require("@popperjs/core"); //throws an error w import statement

export const getDocData = () => {
  const storedDocs = JSON.parse(localStorage.getItem("docList") || "[]");
  let docData: any = {};
  storedDocs.forEach((doc: any) => {
    const keyValuePairs = doc.keyValuePairs;
    Object.keys(keyValuePairs).forEach((key) => {
      docData[key] = keyValuePairs[key];
    });
  });

  return { areThereDocs: !(storedDocs[0] === undefined), docData };
};

export const DropdownTable = (props: {
  dropdownIndex: number;
  eventObj: any;
}) => {
  const dropdownIndex = props.dropdownIndex;
  const dropdownWidth = props.eventObj.target.offsetWidth;

  const { areThereDocs, docData } = getDocData();

  return (
    <div
      id={`dropdown${dropdownIndex}`}
      style={{ width: dropdownWidth }}
      className="dropdown"
      role="dropdown"
    >
      {areThereDocs ? (
        <table className="dropdown-table">
          <tr>
            <th>Field Name</th>
            <th>Field Value</th>
          </tr>
          {Object.keys(docData).map((key, i) => {
            return (
              <tr key={i}>
                <td>{key}</td>
                <td>{docData[key]}</td>
                <td>
                  <button id={`dropdown${dropdownIndex}-key${i}`}>Fill</button>
                </td>
              </tr>
            );
          })}
        </table>
      ) : (
        <p>There are no docs in local storage</p>
      )}
    </div>
  );
};
