import React from "react";
import { getEditDistance } from "./LevenshteinField";

// getting data from local storage
export const getKeyValuePairs = () => {
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

// interface passed between getKeyValuePairs() and getLevenDistanceAndSort()
export interface KeyValues {
  [key: string]: string; //e.g. "Date": "7/5/2015"
}

export const getLevenDistanceAndSort = (
  docData: KeyValues,
  targetString: string
) => {
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

  return docKeyValuePairs;
};

// dropdown table components
const TableHead = (props: { targetString: string }) => {
  return (
    <thead>
      <tr>
        <th>
          Field Name: <i>{props.targetString}</i>
        </th>
        <th>Field Value</th>
      </tr>
    </thead>
  );
};

const TableBody = (props: {
  sortedKeyValuePairs: any;
  dropdownIndex: number;
  eventObj: any;
}) => {
  return (
    <tbody>
      {props.sortedKeyValuePairs.map((keyValue: any, i: number) => {
        const fillButtonHandler = () => {
          props.eventObj.target.value = keyValue["value"];
          console.log(props.eventObj);
        };

        return (
          <tr key={i}>
            <td>
              {i === 0 ? (
                <span>
                  <span className={"closest-match-bubble"}>Closest Match</span>
                  <span className={"closest-match"}>{keyValue["key"]}</span>
                </span>
              ) : (
                keyValue["key"]
              )}
            </td>
            <td>{keyValue["value"]}</td>
            <td>
              <button
                id={`dropdown${props.dropdownIndex}-key${i}`}
                onClick={fillButtonHandler}
              >
                Fill
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export const DropdownTable = (props: {
  dropdownIndex: number;
  eventObj: any;
}) => {
  const eventObj = props.eventObj;
  const dropdownIndex = props.dropdownIndex;
  const dropdownWidth = eventObj.target.offsetWidth;

  const { areThereDocs, docData } = getKeyValuePairs();

  const targetString = props.eventObj.target.placeholder;

  const sortedKeyValuePairs = getLevenDistanceAndSort(docData, targetString);

  console.log(sortedKeyValuePairs);

  return (
    <div
      id={`dropdown${dropdownIndex}`}
      style={{ width: dropdownWidth }}
      className="dropdown"
      role="dropdown"
    >
      {areThereDocs ? (
        <table className="dropdown-table">
          <TableHead targetString={targetString} />
          <TableBody
            sortedKeyValuePairs={sortedKeyValuePairs}
            dropdownIndex={dropdownIndex}
            eventObj={eventObj}
          />
        </table>
      ) : (
        <p>There are no docs in local storage</p>
      )}
    </div>
  );
};
