import React, { useState } from "react";
import { getEditDistance } from "./LevenshteinField";
import styled from "styled-components";
import { HTMLTable, ProgressBar, Icon } from "@blueprintjs/core";

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
  const longestKeyLength = Object.keys(docData).reduce((acc, cv) =>
    acc.length > cv.length ? acc : cv
  ).length;

  const docKeyValuePairs = Object.keys(docData).map((key) => {
    let entry: any = {};
    entry["key"] = key;
    entry["value"] = docData[key];
    entry["distanceFromTarget"] =
      (longestKeyLength - getEditDistance(targetString, key)) /
      longestKeyLength;
    return entry;
  });

  docKeyValuePairs.sort((a, b) =>
    a.distanceFromTarget > b.distanceFromTarget ? -1 : 1
  );

  return docKeyValuePairs;
};

const sortKeyValuePairs = (keyValuePairs: any, sortingMethod: string) => {
  switch (sortingMethod) {
    case "highest match":
      return keyValuePairs.sort((a: any, b: any) =>
        a.distanceFromTarget > b.distanceFromTarget ? -1 : 1
      );
    case "lowest match":
      return keyValuePairs.sort((a: any, b: any) =>
        a.distanceFromTarget > b.distanceFromTarget ? 1 : -1
      );
    case "a-to-z":
      return keyValuePairs.sort((a: any, b: any) => (a.key > b.key ? 1 : -1));
    case "z-to-a":
      return keyValuePairs.sort((a: any, b: any) => (a.key > b.key ? -1 : 1));
  }
};

// dropdown table components
const Dropdown = styled.div`
  background-color: #fdfff4;
  border: 1px solid lightgrey;
  z-index: 40;
  max-height: 24em;
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
  th:nth-child(n + 1):nth-child(-n + 2),
  td:nth-child(n + 1):nth-child(-n + 2) {
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

const TableBody = (props: {
  sortedKeyValuePairs: any;
  dropdownIndex: number;
  eventObj: any;
  bestMatch: string;
}) => {
  const numberOfKVPairs = sortKeyValuePairs.length + 1;

  return (
    <tbody>
      {props.sortedKeyValuePairs.map((keyValue: any, i: number) => {
        const fillButtonHandler = () => {
          props.eventObj.target.value = keyValue["value"];
        };

        return (
          <tr key={i}>
            <td>
              <ProgressBar
                animate={false}
                stripes={false}
                intent={"primary"}
                value={keyValue["distanceFromTarget"]}
              />
            </td>
            <td>
              {keyValue["key"] === props.bestMatch ? (
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

  const targetString = props.eventObj.target.placeholder;
  const { areThereDocs, docData } = getKeyValuePairs();
  const sortedKeyValuePairs = getLevenDistanceAndSort(docData, targetString);
  const bestMatch = sortedKeyValuePairs[0].key;

  const [sort, setSort] = useState("highest match");

  // match score sort
  const [matchArrow, setMatchArrow] = useState("highest match");
  const matchScoreSortHandler = () => {
    if (matchArrow === "lowest match") {
      setSort("highest match");
      setMatchArrow("highest match");
    } else {
      setSort("lowest match");
      setMatchArrow("lowest match");
    }
  };

  // alphabetical sort
  const [alphabetArrow, setAlphabetArrow] = useState("a-to-z");
  const alphabeticSortHandler = () => {
    if (alphabetArrow === "z-to-a") {
      setSort("a-to-z");
      setAlphabetArrow("a-to-z");
    } else {
      setSort("z-to-a");
      setAlphabetArrow("z-to-a");
    }
  };

  return (
    <Dropdown
      id={`dropdown${dropdownIndex}`}
      style={{ width: dropdownWidth }}
      role="dropdown"
    >
      {areThereDocs ? (
        <Table className="dropdown-table">
          <thead>
            <tr>
              <th>
                Match Score{" "}
                <Icon
                  icon={
                    matchArrow === "highest match"
                      ? "symbol-triangle-down"
                      : "symbol-triangle-up"
                  }
                  onClick={matchScoreSortHandler}
                />
              </th>
              <th>
                Field Name: <i>{targetString}</i>{" "}
                <Icon
                  icon={
                    alphabetArrow === "a-to-z"
                      ? "symbol-triangle-down"
                      : "symbol-triangle-up"
                  }
                  onClick={alphabeticSortHandler}
                />
              </th>
              <th>Field Value</th>
            </tr>
          </thead>
          <TableBody
            sortedKeyValuePairs={sortKeyValuePairs(sortedKeyValuePairs, sort)}
            dropdownIndex={dropdownIndex}
            eventObj={eventObj}
            bestMatch={bestMatch}
          />
        </Table>
      ) : (
        <p>There are no docs in local storage</p>
      )}
    </Dropdown>
  );
};
