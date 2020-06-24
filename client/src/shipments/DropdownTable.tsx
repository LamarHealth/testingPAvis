import React from "react";
import { getEditDistance } from "./LevenshteinField";

export const getKeyValuePairsAndSort = () => {
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

  const { areThereDocs, docData } = getKeyValuePairsAndSort();

  const targetString = props.eventObj.target.placeholder;

  const docKeyValuePairs = Object.keys(docData).map((key) => {
    let entry: any = {};
    entry["key"] = key;
    entry["value"] = docData[key];
    entry["distanceFromTarget"] = getEditDistance(targetString, key);
    return entry;
  });

  docKeyValuePairs.sort((a, b) =>
    a.distanceFromTarget > b.distanceFromTarget ? 1 : -1
  );

  return (
    <div
      id={`dropdown${dropdownIndex}`}
      style={{ width: dropdownWidth }}
      className="dropdown"
      role="dropdown"
    >
      {areThereDocs ? (
        <table className="dropdown-table">
          <thead>
            <tr>
              <th>Field Name</th>
              <th>Field Value</th>
            </tr>
          </thead>
          <tbody>
            {docKeyValuePairs.map((keyValue, i) => {
              const fillButtonHandler = () => {
                props.eventObj.target.value = keyValue["value"];
              };

              return (
                <tr key={i}>
                  <td>
                    {i === 0 ? (
                      <span>
                        <span className={"closest-match-bubble"}>
                          Closest Match
                        </span>
                        <span className={"closest-match"}>
                          {keyValue["key"]}
                        </span>
                      </span>
                    ) : (
                      keyValue["key"]
                    )}
                  </td>
                  <td>{keyValue["value"]}</td>
                  <td>
                    <button
                      id={`dropdown${dropdownIndex}-key${i}`}
                      onClick={fillButtonHandler}
                    >
                      Fill
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>There are no docs in local storage</p>
      )}
    </div>
  );
};
