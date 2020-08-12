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
import {
  MAIN_MODAL_WIDTH,
  MAIN_MODAL_OFFSET_X,
  MAIN_MODAL_OFFSET_Y,
  API_PATH,
  MODAL_SHADOW,
} from "../common/constants";
import { ManualSelect } from "./ManualSelect";
import {
  getKeyValuePairsByDoc,
  getEditDistanceAndSort,
  sortKeyValuePairs,
  KeyValuesWithDistance,
  deleteKVPairFromLocalStorage,
  KeyValuesByDoc,
} from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";
import { MainModalContext } from "./RenderModal";
import { renderAccuracyScore } from "./AccuracyScoreCircle";
import { ErrorMessage } from "./ManualSelect";

const ModalWrapper = styled.div`
  top: ${MAIN_MODAL_OFFSET_Y}px;
  left: ${MAIN_MODAL_OFFSET_X}px;
  position: absolute;
  background-color: ${colors.DROPDOWN_TABLE_BACKGROUND_GREEN};
  z-index: 2;
  max-height: 500px;
  overflow-x: hidden;
  overflow-y: scroll;
  width: ${MAIN_MODAL_WIDTH}px;
  border: 1px solid ${colors.MODAL_BORDER};
  box-shadow: ${MODAL_SHADOW};
`;

const CloseButton = styled.button`
  float: right;
  margin: 1em;
  height: 3em;
  width: 3em;
  background: none;
  border: none;
  border-radius: 50%;
  transition: 0.5s;

  :hover {
    border: 1px solid ${colors.DROPZONE_TEXT_GREY};
  }
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

const ButtonsCell = (props: { keyValue: KeyValuesWithDistance }) => {
  const { setMainModalOpen } = useContext(MainModalContext);
  const {
    selectedDocData,
    setDocData,
    setRemoveKVMessage,
    setMessageCollapse,
    eventObj,
    targetString,
  } = useContext(TableContext);
  const [softCollapse, setSoftCollapse] = useState(false);
  const [hardCollapse, setHardCollapse] = useState(false);
  const keyValue = props.keyValue;

  const fillButtonHandler = () => {
    eventObj.target.value = keyValue["value"];
    setMainModalOpen(false);
    renderAccuracyScore(eventObj.target, keyValue);
  };
  const reportKVPair = async (remove: boolean = false) => {
    if (remove) {
      deleteKVPairFromLocalStorage(
        selectedDocData.docID,
        keyValue["key"],
        keyValue["value"]
      );
    }

    setDocData(getKeyValuePairsByDoc());
    setHardCollapse(true);
    setSoftCollapse(false);

    // query server
    const docName = selectedDocData.docName;
    const docType = selectedDocData.docType;
    const docID = selectedDocData.docID;

    const result = await fetch(
      `${API_PATH}/api/report-kv-pair/${docID}/${encodeURIComponent(`
        ${docName}.${docType}`)}`,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          targetString,
          key: keyValue["key"],
          value: keyValue["value"],
        }),
      }
    );

    // set message
    setMessageCollapse(true);
    switch (result.status) {
      case 202:
        const statusMessage = (await result.json()).status;
        setRemoveKVMessage(statusMessage);
        break;
      default:
        setRemoveKVMessage(
          "The faulty key / value pair has been removed from your browser, but we are unable to pass this note on to the server at this time."
        );
        break;
    }
  };

  // cleanup
  useEffect(() => {
    setHardCollapse(false);
    const closeMessage = setTimeout(() => setMessageCollapse(false), 5000);
    return () => clearTimeout(closeMessage);
  }, [hardCollapse]);

  return (
    <>
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
            label="Report Unrelated"
            variant="outlined"
            onClick={() => reportKVPair()}
            style={{ marginBottom: "1em" }}
          />
          <Chip
            label="Delete Row"
            variant="outlined"
            onClick={() => reportKVPair(true)}
          />
        </Collapse>
      </ClickAwayListener>
    </>
  );
};

const TableRowComponent = (props: {
  keyValue: KeyValuesWithDistance;
  bestMatch: string;
  i: number;
}) => {
  const keyValue = props.keyValue;

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
        {keyValue.interpretedFrom && (
          <Typography variant="caption">
            <i>Interpreted from: {keyValue["interpretedFrom"]}</i>
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography>{keyValue["value"]}</Typography>
      </TableCell>
      <TableCell>
        <ButtonsCell keyValue={keyValue} />
      </TableCell>
    </TableRow>
  );
};

const TableContext = createContext({} as any);

const TableComponent = () => {
  const { targetString, selectedDocData } = useContext(TableContext);
  const sortedKeyValuePairs = getEditDistanceAndSort(
    selectedDocData,
    targetString,
    "lc substring"
  );
  const bestMatch = sortedKeyValuePairs[0].key;

  const [sort, setSort] = useState(
    "highest match" as "highest match" | "lowest match" | "a-to-z" | "z-to-a"
  );

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
      <TableBody>
        {dynamicallySortedKeyValuePairs.map((keyValue: any, i: number) => (
          <TableRowComponent keyValue={keyValue} bestMatch={bestMatch} i={i} />
        ))}
      </TableBody>
    </Table>
  );
};

const Message = ({ msg }: any) => {
  return (
    <ErrorMessage>
      <i>{msg}</i>
    </ErrorMessage>
  );
};

export interface SelectProps {
  eventObj: any;
  targetString: string;
}

export const SelectModal = ({ eventObj, targetString }: SelectProps) => {
  const [removeKVMessage, setRemoveKVMessage] = useState("" as any);
  const [messageCollapse, setMessageCollapse] = useState(false);
  const { setMainModalOpen, setMainModalHeight } = useContext(MainModalContext);

  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);
  const [docData, setDocData] = useState(getKeyValuePairsByDoc());
  const filterDocData = (docData: KeyValuesByDoc[]) =>
    docData.filter(
      (doc: KeyValuesByDoc) => doc.docID === globalSelectedFile.get()
    )[0];
  const selectedDocData = filterDocData(docData);

  const checkKVPairs = (selectedDocData: KeyValuesByDoc) =>
    Object.keys(selectedDocData.keyValuePairs).length > 0;
  let areThereKVPairs;

  // handle if doc is added while modal open
  if (selectedDocData === undefined) {
    const newDocData = getKeyValuePairsByDoc();
    // need to set both separately, because react setState() is async
    setDocData(newDocData);
    areThereKVPairs = checkKVPairs(filterDocData(newDocData));
  } else {
    areThereKVPairs = checkKVPairs(selectedDocData);
  }

  return (
    <ModalWrapper
      // set modal height
      ref={(input: HTMLDivElement) => {
        // need to cast type to getComputedStyle()
        const wrapper = input as Element;
        if (wrapper as Element) {
          const modalHeight = parseInt(
            window.getComputedStyle(wrapper).height.replace("px", "")
          );
          setMainModalHeight(modalHeight);
        }
      }}
    >
      <CloseButton onClick={() => setMainModalOpen(false)}>X</CloseButton>
      <ManualSelect eventObj={eventObj}></ManualSelect>
      <Collapse in={messageCollapse}>
        <Message msg={removeKVMessage} />
      </Collapse>
      {areThereKVPairs ? (
        <TableContext.Provider
          value={{
            targetString,
            selectedDocData,
            setDocData,
            setRemoveKVMessage,
            setMessageCollapse,
            eventObj,
          }}
        >
          <TableComponent />
        </TableContext.Provider>
      ) : (
        <Message
          msg={
            "The selected document doesn't have any key / value pairs. Try using Manual Select."
          }
        />
      )}
    </ModalWrapper>
  );
};
