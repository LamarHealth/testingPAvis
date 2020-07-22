import React, { useState, createContext, useContext, useEffect } from "react";

import { useState as useSpecialHookState } from "@hookstate/core";

import styled from "styled-components";

import IconButton from "@material-ui/core/IconButton";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import Collapse from "@material-ui/core/Collapse";
import Chip from "@material-ui/core/Chip";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import { colors } from "../common/colors";
import { MODAL_WIDTH } from "../common/constants";
import { ManualSelect } from "./ManualSelect";
import {
  getKeyValuePairsByDoc,
  getLevenDistanceAndSort,
  sortKeyValuePairs,
  KeyValuesWithDistance,
  deleteKeyValuePairFromDoc,
} from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";
import { ModalContext } from "./RenderModal";

const ModalWrapper = styled.div`
  top: 100px;
  left: ${(window.innerWidth - MODAL_WIDTH) / 2}px;
  position: absolute;
  background-color: ${colors.DROPDOWN_TABLE_BACKGROUND_GREEN};
  z-index: 2;
  max-height: 500px;
  overflow-x: hidden;
  overflow-y: scroll;
  width: ${MODAL_WIDTH}px;
`;

const FillButton = styled.button`
  background-color: ${colors.FILL_BUTTON};
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

const DownArrow = styled(ArrowDropDownIcon)`
  width: 2em;
  height: 2em;
`;

const UpArrow = styled(ArrowDropUpIcon)`
  width: 2em;
  height: 2em;
`;

const StyledIconButton = styled(IconButton)`
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  width: 2em;
  height: 2em;
  font-size: 1em;
`;

const FlexCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TableRowContext = createContext({} as any);

const TableRowComponent = (props: {
  keyValue: KeyValuesWithDistance;
  eventObj: any;
  bestMatch: string;
  i: number;
}) => {
  const keyValue = props.keyValue;
  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);
  const { setMainModalOpen } = useContext(ModalContext);
  const { setDocData } = useContext(TableRowContext);
  const [softCollapse, setSoftCollapse] = useState(false);
  const [hardCollapse, setHardCollapse] = useState(false);

  const fillButtonHandler = () => {
    props.eventObj.target.value = keyValue["value"];
    setMainModalOpen(false);
  };
  const removeKVPair = () => {
    deleteKeyValuePairFromDoc(
      globalSelectedFile,
      keyValue["key"],
      keyValue["value"]
    );
    setDocData(getKeyValuePairsByDoc());
    setHardCollapse(true);
    setSoftCollapse(false);
  };

  useEffect(() => {
    setHardCollapse(false);
  }, [hardCollapse]);

  return (
    <TableRow
      key={props.i}
      className={
        keyValue["key"] === props.bestMatch ? "closest-match-row" : "table-row"
      }
    >
      <TableCell>
        <LinearProgress
          variant={"determinate"}
          value={keyValue["distanceFromTarget"] * 100}
        />
        {keyValue["key"] === props.bestMatch && (
          <ClosestMatch>
            <Typography>
              <i>closest match</i>
            </Typography>
          </ClosestMatch>
        )}
      </TableCell>
      <TableCell>
        <Typography>{keyValue["key"]}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{keyValue["value"]}</Typography>
      </TableCell>
      <TableCell>
        <Collapse in={!softCollapse} timeout={hardCollapse ? 0 : "auto"}>
          <FlexCell>
            <FillButton onClick={fillButtonHandler}>Fill</FillButton>
            <IconButton onClick={() => setSoftCollapse(true)}>
              <HighlightOffIcon />
            </IconButton>
          </FlexCell>
        </Collapse>
        <ClickAwayListener
          mouseEvent="onMouseDown"
          touchEvent="onTouchStart"
          onClickAway={() => setSoftCollapse(false)}
        >
          <Collapse in={softCollapse} timeout={hardCollapse ? 0 : "auto"}>
            <Chip
              label="Confirm Unrelated"
              variant="outlined"
              onClick={removeKVPair}
            />
          </Collapse>
        </ClickAwayListener>
      </TableCell>
    </TableRow>
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
      <TableCell>
        <FlexCell>
          <Typography variant="subtitle1">Match Score</Typography>
          <StyledIconButton onClick={matchScoreSortHandler}>
            {matchArrow === "highest match" ? <DownArrow /> : <UpArrow />}
          </StyledIconButton>
        </FlexCell>
      </TableCell>
      <TableCell>
        <FlexCell>
          <Typography variant="subtitle1">
            Field Name: <i>{targetString}</i>
          </Typography>
          <StyledIconButton onClick={alphabeticSortHandler}>
            {alphabetArrow === "a-to-z" ? <DownArrow /> : <UpArrow />}
          </StyledIconButton>
        </FlexCell>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle1">Field Value</Typography>
      </TableCell>
      <TableCell />
    </TableHead>
  );
};

export const SelectModal = ({ eventObj }: any) => {
  const targetString = eventObj.target.placeholder;

  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);
  const [docData, setDocData] = useState(getKeyValuePairsByDoc());
  const selectedDocData = docData.filter(
    (doc) => doc.docID === globalSelectedFile.get()
  )[0];

  const sortedKeyValuePairs = getLevenDistanceAndSort(
    selectedDocData,
    targetString
  );
  const bestMatch = sortedKeyValuePairs[0].key;

  const [sort, setSort] = useState("highest match");

  const dynamicallySortedKeyValuePairs = sortKeyValuePairs(
    sortedKeyValuePairs,
    sort
  );

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

  // rewriting pesky styles that penetrate the shadow DOM
  const rewriteStyles = () => {
    const popoverEl = document.getElementById("docit-main-modal");
    const shadowRoot = popoverEl?.children[2].shadowRoot;
    const newStyles = document.createElement("style");
    newStyles.innerHTML = `
      :host * {
        font-family: Roboto, Helvetica, Arial, sans-serif;
      }
    `;
    newStyles.type = "text/css";
    shadowRoot?.appendChild(newStyles);
  };

  useEffect(() => rewriteStyles(), []);

  return (
    <ModalWrapper>
      <ManualSelect eventObj={eventObj}></ManualSelect>
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
        <TableBody>
          <TableRowContext.Provider value={{ setDocData }}>
            {dynamicallySortedKeyValuePairs.map((keyValue: any, i: number) => (
              <TableRowComponent
                keyValue={keyValue}
                eventObj={eventObj}
                bestMatch={bestMatch}
                i={i}
              />
            ))}
          </TableRowContext.Provider>
        </TableBody>
      </Table>
    </ModalWrapper>
  );
};
