import React, { useState, createContext, useContext } from "react";
import styled from "styled-components";

import { useState as useSpecialHookState } from "@hookstate/core";

import IconButton from "@material-ui/core/IconButton";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import LinearProgress from "@material-ui/core/LinearProgress";

import { colors } from "./../common/colors";
import { ManualSelect } from "./ManualSelect";
import {
  getKeyValuePairsByDoc,
  getLevenDistanceAndSort,
  sortKeyValuePairs,
  KeyValuesWithDistance,
} from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";

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

const StyledArrowDropdownIcon = styled(ArrowDropDownIcon)`
  width: 2em;
  height: 2em;
`;

const StyledArrowDropupIcon = styled(ArrowDropUpIcon)`
  width: 2em;
  height: 2em;
`;

const StyledIconButton = styled(IconButton)`
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;

  :hover {
    opacity: 0.5;
  }
`;

const TableBodyComponent = (props: {
  sortedKeyValuePairs: KeyValuesWithDistance[];
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

const TableHeadContext = createContext({} as any);

const TableHeadComponent = ({ targetString }: any) => {
  const {
    matchArrow,
    matchScoreSortHandler,
    alphabetArrow,
    alphabeticSortHandler,
  } = useContext(TableHeadContext);

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <StyledIconButton onClick={matchScoreSortHandler}>
            <table>
              <tr>
                <td>
                  {matchArrow === "highest match" ? (
                    <StyledArrowDropdownIcon />
                  ) : (
                    <StyledArrowDropupIcon />
                  )}
                </td>
                <td>Match Score</td>
              </tr>
            </table>
          </StyledIconButton>
        </TableCell>
        <TableCell>
          <StyledIconButton onClick={alphabeticSortHandler}>
            <table>
              <tr>
                <td>
                  {alphabetArrow === "a-to-z" ? (
                    <StyledArrowDropdownIcon />
                  ) : (
                    <StyledArrowDropupIcon />
                  )}
                </td>
                <td>
                  Field Name: <i>{targetString}</i>
                </td>
              </tr>
            </table>
          </StyledIconButton>
        </TableCell>
        <TableCell>Field Value</TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

export const DropdownTable = (props: { eventObj: any }) => {
  const eventObj = props.eventObj;
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
      <TableHeadContext.Provider
        value={{
          matchArrow,
          matchScoreSortHandler,
          alphabetArrow,
          alphabeticSortHandler,
        }}
      >
        <TableHeadComponent targetString={targetString} />
      </TableHeadContext.Provider>
      <TableBodyComponent
        sortedKeyValuePairs={sortKeyValuePairs(sortedKeyValuePairs, sort)}
        eventObj={eventObj}
        bestMatch={bestMatch}
      />
    </Table>
  );
};

export const Dropdown = ({ eventObj }: any) => {
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";
  const targetWidth = eventObj.target.offsetWidth;

  return (
    <DropdownWrapper id={`dropdown`} role="dropdown">
      {areThereDocs ? (
        isDocSelected ? (
          <div
            style={
              targetWidth > 700 ? { width: targetWidth } : { width: "700px" }
            }
          >
            <ManualSelect eventObj={eventObj}></ManualSelect>
            <DropdownTable eventObj={eventObj}></DropdownTable>
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
