import React, { useState } from "react";
import styled from "styled-components";
import { HTMLTable, ProgressBar, Icon } from "@blueprintjs/core";
import { useState as useSpecialHookState } from "@hookstate/core";

import { colors } from "./../common/colors";
import { ManualSelect } from "./ManualSelect";
import {
  getKeyValuePairsByDoc,
  getLevenDistanceAndSort,
  sortKeyValuePairs,
  KeyValuesWithDistance,
} from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";

// dropdown table components
const DropdownWrapper = styled.div`
  background-color: ${colors.DROPDOWN_TABLE_BACKGROUND_GREEN};
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
  width: 100%;

  td:nth-child(n + 1):nth-child(-n + 2) + td,
  th:nth-child(n + 1):nth-child(-n + 2) + th {
    border-left: 1px solid lightgrey;
  }

  tbody tr {
    border-bottom: 1px solid lightgrey;

    td:nth-child(4) {
      text-align: right;
    }
  }

  th,
  td {
    padding: 0.3em;
  }

  .closest-match-row {
    background-color: ${colors.CLOSEST_MATCH_ROW};
  }
`;

const FillButton = styled.button`
  background-color: #22c062;
  color: white;
  border: 1px solid white;
  border-radius: 5px;
  width: 4em;
  height: 2em;
  font-weight: bold;

  :hover {
    opacity: 0.5;
  }
`;

const ClosestMatch = styled.button`
  padding: 0;
  width: 6.5em;
  border: none;
  background-color: ${colors.TRANSPARENT};
  text-align: left;
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
              {keyValue["key"] === props.bestMatch && (
                <ClosestMatch>
                  <i>closest match</i>
                </ClosestMatch>
              )}
            </td>
            <td>{keyValue["key"]}</td>
            <td>{keyValue["value"]}</td>
            <td onClick={fillButtonHandler}>
              <FillButton>Fill</FillButton>
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
  const targetString = props.eventObj.target.placeholder;

  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);
  const docData = getKeyValuePairsByDoc();
  const selectedDocData = docData.filter(
    (doc) => doc.docID === globalSelectedFile.get()
  )[0];

  const sortedKeyValuePairs = getLevenDistanceAndSort(
    selectedDocData,
    targetString
  );
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

export const Dropdown = ({ dropdownIndex, eventObj }: any) => {
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";
  const targetWidth = eventObj.target.offsetWidth;

  return (
    <DropdownWrapper id={`dropdown${dropdownIndex}`} role="dropdown">
      {areThereDocs ? (
        isDocSelected ? (
          <div
            style={
              targetWidth > 700 ? { width: targetWidth } : { width: "700px" }
            }
          >
            <ManualSelect eventObj={eventObj}></ManualSelect>
            <DropdownTable
              dropdownIndex={dropdownIndex}
              eventObj={eventObj}
            ></DropdownTable>
          </div>
        ) : (
          <p>Select a doc to see fill options</p>
        )
      ) : (
        <p>Upload documents on the sidebar to load results.</p>
      )}
    </DropdownWrapper>
  );
};
