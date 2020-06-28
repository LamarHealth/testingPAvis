import React, { useState } from "react";
import styled from "styled-components";
import { HTMLTable, ProgressBar, Icon, Dialog } from "@blueprintjs/core";

import { ManualSelect } from "./ManualSelect";
import {
  getKeyValuePairsByDoc,
  getAllKeyValuePairs,
  getLevenDistanceAndSort,
  sortKeyValuePairs,
  KeyValuesWithDistance,
} from "./KeyValuePairs";

// dropdown table components
const DropdownWrapper = styled.div`
  background-color: #fdfff4;
  border: 1px solid lightgrey;
  z-index: 2;
  max-height: 24em;
  overflow-x: hidden;
  overflow-y: scroll;

  p {
    padding: 0.7em;
    margin: 0;
  }
`;

const Table = styled(HTMLTable)`
  border-collapse: collapse;
  margin: 0;
  text-align: left;
  width: inherit;

  td:nth-child(n + 1):nth-child(-n + 2) + td,
  th:nth-child(n + 1):nth-child(-n + 2) + th {
    border-left: 1px solid lightgrey;
  }

  tbody tr {
    border-bottom: 1px solid lightgrey;
  }

  th,
  td {
    padding: 0.3em;
  }

  .closest-match-row {
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

  :hover {
    opacity: 0.5;
  }
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
  sortedKeyValuePairs: KeyValuesWithDistance[];
  dropdownIndex: number;
  eventObj: any;
  bestMatch: string;
}) => {
  return (
    <tbody>
      {props.sortedKeyValuePairs.map((keyValue: any, i: number) => {
        const fillButtonHandler = () => {
          props.eventObj.target.value = keyValue["value"];
        };

        return (
          <tr
            key={i}
            className={
              keyValue["key"] === props.bestMatch
                ? "closest-match-row"
                : "table-row"
            }
          >
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
  const { areThereDocs, docData } = getAllKeyValuePairs();

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
    <Table className="dropdown-table">
      <thead>
        <tr>
          <th>
            <Icon
              icon={
                matchArrow === "highest match"
                  ? "symbol-triangle-down"
                  : "symbol-triangle-up"
              }
              onClick={matchScoreSortHandler}
            />
            Match Score
          </th>
          <th>
            <Icon
              icon={
                alphabetArrow === "a-to-z"
                  ? "symbol-triangle-down"
                  : "symbol-triangle-up"
              }
              onClick={alphabeticSortHandler}
            />
            Field Name: <i>{targetString}</i>
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
  );
};

export const Dropdown = (props: { dropdownIndex: number; eventObj: any }) => {
  const areThereDocs = getAllKeyValuePairs().areThereDocs;
  return (
    <DropdownWrapper
      id={`dropdown${props.dropdownIndex}`}
      style={{ width: props.eventObj.target.offsetWidth }}
      role="dropdown"
    >
      {areThereDocs ? (
        <div>
          <ManualSelect eventObj={props.eventObj}></ManualSelect>
          <DropdownTable
            dropdownIndex={props.dropdownIndex}
            eventObj={props.eventObj}
          ></DropdownTable>
        </div>
      ) : (
        <p>There are no docs in local storage</p>
      )}
    </DropdownWrapper>
  );
};
