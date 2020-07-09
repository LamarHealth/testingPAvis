import React, { useState } from "react";
import styled from "styled-components";

import { useState as useSpecialHookState } from "@hookstate/core";

// OLD
import { HTMLTable, ProgressBar, Icon } from "@blueprintjs/core";

// NEW
import IconButton from "@material-ui/core/IconButton";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import LinearProgress from "@material-ui/core/LinearProgress";

import WrappedJssComponent from "./ShadowComponent";

import { jssPreset, StylesProvider } from "@material-ui/styles";
import { create } from "jss";

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

const BlueprintTable = styled(HTMLTable)`
  border-collapse: collapse;
  margin: 0;
  text-align: left;
  width: 100%;

  TableCell:nth-child(n + 1):nth-child(-n + 2) + TableCell,
  th:nth-child(n + 1):nth-child(-n + 2) + th {
    border-left: 1px solid lightgrey;
  }

  tbody tr {
    border-bottom: 1px solid lightgrey;

    TableCell:nth-child(4) {
      text-align: right;
    }
  }

  th,
  TableCell {
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

const TableBodyComponent = (props: {
  sortedKeyValuePairs: KeyValuesWithDistance[];
  dropdownIndex: number;
  eventObj: any;
  bestMatch: string;
}) => {
  return (
    <TableBody>
      {props.sortedKeyValuePairs.map((keyValue: any, i: number) => {
        const fillButtonHandler = () => {
          props.eventObj.target.value = keyValue["value"];
        };

        return (
          <TableRow
            key={i}
            className={
              keyValue["key"] === props.bestMatch
                ? "closest-match-row"
                : "table-row"
            }
          >
            <TableCell>
              <LinearProgress
                variant={"determinate"}
                value={keyValue["distanceFromTarget"] * 100}
              />
              {keyValue["key"] === props.bestMatch && (
                <ClosestMatch>
                  <i>closest match</i>
                </ClosestMatch>
              )}
            </TableCell>
            <TableCell>{keyValue["key"]}</TableCell>
            <TableCell>{keyValue["value"]}</TableCell>
            <TableCell onClick={fillButtonHandler}>
              <FillButton>Fill</FillButton>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
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
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <IconButton onClick={matchScoreSortHandler}>
              {matchArrow === "highest match" ? (
                <ArrowDropDownIcon />
              ) : (
                <ArrowDropUpIcon />
              )}
            </IconButton>
            Match Score
          </TableCell>
          <TableCell>
            <IconButton onClick={alphabeticSortHandler}>
              {alphabetArrow === "a-to-z" ? (
                <ArrowDropDownIcon />
              ) : (
                <ArrowDropUpIcon />
              )}
            </IconButton>
            Field Name: <i>{targetString}</i>
          </TableCell>
          <TableCell>Field Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBodyComponent
        sortedKeyValuePairs={sortKeyValuePairs(sortedKeyValuePairs, sort)}
        dropdownIndex={dropdownIndex}
        eventObj={eventObj}
        bestMatch={bestMatch}
      />
    </Table>
  );
};

export const Dropdown = (props: { dropdownIndex: number; eventObj: any }) => {
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";

  return (
    <DropdownWrapper
      id={`dropdown${props.dropdownIndex}`}
      style={{ width: props.eventObj.target.offsetWidth }}
      role="dropdown"
    >
      {/* <WrappedJssComponent> */}
      {areThereDocs ? (
        isDocSelected ? (
          <div>
            <ManualSelect eventObj={props.eventObj}></ManualSelect>
            <DropdownTable
              dropdownIndex={props.dropdownIndex}
              eventObj={props.eventObj}
            ></DropdownTable>
          </div>
        ) : (
          <p>Select a doc to see fill options</p>
        )
      ) : (
        <p>Upload documents on the sidebar to load results.</p>
      )}
      {/* </WrappedJssComponent> */}
    </DropdownWrapper>
  );
};
