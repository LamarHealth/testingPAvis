import React from "react";
import { getEditDistance } from "./LevenshteinField";
import styled from "styled-components";
import { HTMLTable } from "@blueprintjs/core";

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
const Dropdown = styled.div`
  background-color: #fdfff4;
  border: 1px solid lightgrey;
  z-index: 40;
  max-height: 18em;
  overflow-x: hidden;
  overflow-y: scroll;

  p {
    padding: 0.7em;
    margin: 0;
  }
`;

const Table = styled(HTMLTable)`
  border: 1px solid lightgrey;
  border-collapse: collapse;
  margin: 0;
  text-align: left;
  width: inherit;

  tr,
  th:nth-child(1),
  td:nth-child(1) {
    border: 1px solid lightgrey;
  }

  th,
  td {
    padding: 0.3em;
  }

  tbody tr:nth-child(1) {
    background-color: hsla(72, 69%, 74%, 0.4);
  }
`;

const FillButton = styled.button`
  background-color: #22c062;
  color: white;
  border: none;
  border-radius: 5px;
  width: 4em;
  height: 2em;
  font-weight: bold;
`;

const ClosestMatchBubble = styled.span`
  background-color: #9ae95c;
  border: 1px solid white;
  border-radius: 0.5em;
  padding: 0.2em 0.5em;
`;

const ClosestMatch = styled.span`
  margin-left: 0.5em;
`;

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
                  <ClosestMatchBubble>Closest Match</ClosestMatchBubble>
                  <ClosestMatch>{keyValue["key"]}</ClosestMatch>
                </span>
              ) : (
                keyValue["key"]
              )}
            </td>
            <td>{keyValue["value"]}</td>
            <td>
              <FillButton
                id={`dropdown${props.dropdownIndex}-key${i}`}
                onClick={fillButtonHandler}
              >
                Fill
              </FillButton>
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

  return (
    <Dropdown
      id={`dropdown${dropdownIndex}`}
      style={{ width: dropdownWidth }}
      role="dropdown"
    >
      {areThereDocs ? (
        <Table className="dropdown-table">
          <TableHead targetString={targetString} />
          <TableBody
            sortedKeyValuePairs={sortedKeyValuePairs}
            dropdownIndex={dropdownIndex}
            eventObj={eventObj}
          />
        </Table>
      ) : (
        <p>There are no docs in local storage</p>
      )}
    </Dropdown>
  );
};
