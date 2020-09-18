import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";

import { useState as useSpecialHookState } from "@hookstate/core";

import styled from "styled-components";

import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
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
import VisibilityIcon from "@material-ui/icons/Visibility";
import TextField from "@material-ui/core/TextField";

import { colors } from "../common/colors";
import { MAIN_MODAL_WIDTH, API_PATH, MODAL_SHADOW } from "../common/constants";
import {
  getKeyValuePairsByDoc,
  getEditDistanceAndSort,
  sortKeyValuePairs,
  KeyValuesWithDistance,
  deleteKVPairFromLocalStorage,
  KeyValuesByDoc,
} from "./KeyValuePairs";
import { globalSelectedFileState } from "../contexts/SelectedFile";
import { MainModalContext } from "./RenderModal";
import { renderAccuracyScore, renderBlankChiclet } from "./AccuracyScoreCircle";
import { globalDocData } from "../contexts/DocData";
import { globalSelectedChiclet } from "../contexts/ChicletSelection";

const ModalWrapper = styled.div`
  background-color: ${colors.DROPDOWN_TABLE_BACKGROUND};
  z-index: 9;
  max-height: 380px;
  overflow-x: hidden;
  overflow-y: scroll;
  width: ${MAIN_MODAL_WIDTH}px;
  border: 1px solid ${colors.MODAL_BORDER};
  box-shadow: ${MODAL_SHADOW};
`;

const StyledTableCellLeft = styled(TableCell)`
  padding: 5px 5px 5px 10px;
`;

const StyledTableCellMiddle = styled(TableCell)`
  padding: 5px;
`;

const StyledTableCellRight = styled(TableCell)`
  padding: 5px 10px 5px 5px;
`;

const StyledTableHeadCell = styled(TableCell)`
  padding: 10px;
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

const CloseButton = styled(IconButton)`
  float: right;
`;

const DocName = styled(Typography)`
  margin: 10px 10px 0 10px;
`;

const TextInputContainer = styled.div`
  width: 100%;
  padding: 0 10px 10px 10px;
  box-sizing: border-box;
`;

const BigButton = styled(Chip)`
  font-weight: bold;
  padding: 0.3em 1.3em;
  margin: 0 10px;
`;

const ErrorMessage = styled(Typography)`
  margin: 1em;
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
      <StyledTableHeadCell>
        <FlexCell>
          <Typography variant="subtitle1" noWrap>
            Match Score
          </Typography>
          <StyledIconButton onClick={matchScoreSortHandler}>
            {matchArrow === "highest match" ? <DownArrow /> : <UpArrow />}
          </StyledIconButton>
        </FlexCell>
      </StyledTableHeadCell>
      <StyledTableHeadCell>
        <FlexCell>
          <Typography variant="subtitle1" noWrap>
            Field Name
          </Typography>
          <StyledIconButton onClick={alphabeticSortHandler}>
            {alphabetArrow === "a-to-z" ? <DownArrow /> : <UpArrow />}
          </StyledIconButton>
        </FlexCell>
      </StyledTableHeadCell>
      <StyledTableHeadCell>
        <Typography variant="subtitle1" noWrap>
          Field Value
        </Typography>
      </StyledTableHeadCell>
      <StyledTableHeadCell />
    </TableHead>
  );
};

const ButtonsCell = (props: {
  keyValue: KeyValuesWithDistance;
  isSelected: Boolean;
}) => {
  const {
    selectedDocData,
    setRemoveKVMessage,
    setMessageCollapse,
    eventTarget,
    targetString,
    setUnalteredKeyValue,
  } = useContext(TableContext);
  const docData = useSpecialHookState(globalDocData);
  const [softCollapse, setSoftCollapse] = useState(false);
  const [hardCollapse, setHardCollapse] = useState(false);
  const keyValue = props.keyValue;
  const isSelected = props.isSelected;

  const fillButtonHandler = () => {
    // renderAccuracyScore(eventTarget, keyValue);

    // fill the kvp table input
    const shadowWrapper: any = document.querySelector(
      ".shadow-root-for-modals"
    );
    const shadowRoot: any = shadowWrapper.children[0].shadowRoot;
    const inputEl: any = shadowRoot.getElementById("kvp-table-fill-text-input");
    inputEl.value = keyValue["value"];

    // let the parent component know what the original string is
    setUnalteredKeyValue(keyValue);
  };

  const reportKVPair = async (remove: boolean = false) => {
    if (remove) {
      deleteKVPairFromLocalStorage(
        selectedDocData.docID,
        keyValue["key"],
        keyValue["value"]
      );
    }

    docData.set(JSON.stringify(getKeyValuePairsByDoc()));
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
          <IconButton
            style={
              isSelected ? { visibility: "visible" } : { visibility: "hidden" }
            }
          >
            <VisibilityIcon />
          </IconButton>
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

const TableRowContext = createContext({} as any);

const TableRowComponent = (props: {
  keyValue: KeyValuesWithDistance;
  bestMatch: string;
  i: number;
}) => {
  const keyValue = props.keyValue;
  const index = props.i;
  const { selectedRow, setSelectedRow } = useContext(TableRowContext);
  const isSelected = selectedRow === index ? true : false;

  const handleRowClick = () => {
    selectedRow === index ? setSelectedRow(null) : setSelectedRow(index);
  };

  return (
    <TableRow
      key={index}
      onClick={handleRowClick}
      style={
        isSelected
          ? { backgroundColor: `${colors.ACCURACY_SCORE_LIGHTBLUE}` }
          : { backgroundColor: `${colors.DROPDOWN_TABLE_BACKGROUND}` }
      }
    >
      <StyledTableCellLeft>
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
      </StyledTableCellLeft>
      <StyledTableCellMiddle>
        <Typography>{keyValue["key"]}</Typography>
        {keyValue.interpretedFrom && (
          <Typography variant="caption">
            <i>Interpreted from: {keyValue["interpretedFrom"]}</i>
          </Typography>
        )}
      </StyledTableCellMiddle>
      <StyledTableCellMiddle>
        <Typography>{keyValue["value"]}</Typography>
      </StyledTableCellMiddle>
      <StyledTableCellRight>
        <ButtonsCell keyValue={keyValue} isSelected={isSelected} />
      </StyledTableCellRight>
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

  // selected row
  const [selectedRow, setSelectedRow] = useState(null as null | number);

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
        <TableRowContext.Provider value={{ selectedRow, setSelectedRow }}>
          {dynamicallySortedKeyValuePairs.map((keyValue: any, i: number) => (
            <TableRowComponent
              keyValue={keyValue}
              bestMatch={bestMatch}
              i={i}
            />
          ))}
        </TableRowContext.Provider>
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

const ErrorLine = (props: { errorCode: number; msg: string }) => {
  return (
    <ErrorMessage>
      <i>
        <strong>Error {props.errorCode}</strong>: {props.msg}
      </i>
    </ErrorMessage>
  );
};

export interface SelectProps {
  eventTarget: any;
  targetString: string;
}

export const SelectModal = ({ eventTarget, targetString }: SelectProps) => {
  const [removeKVMessage, setRemoveKVMessage] = useState("" as string);
  const [messageCollapse, setMessageCollapse] = useState(false);
  const selectedChiclet = useSpecialHookState(globalSelectedChiclet);
  const {
    setKvpTableAnchorEl,
    setKonvaModalOpen,
    errorFetchingImage,
    setErrorFetchingImage,
    errorFetchingGeometry,
    setErrorFetchingGeometry,
    errorMessage,
    errorCode,
  } = useContext(MainModalContext);
  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);
  const docData = useSpecialHookState(globalDocData);
  const selectedDocData = JSON.parse(docData.get()).filter(
    (doc: KeyValuesByDoc) => doc.docID === globalSelectedFile.get()
  )[0];
  const areThereKVPairs = Object.keys(selectedDocData.keyValuePairs).length > 0;
  const [unalteredKeyValue, setUnalteredKeyValue] = useState(null);
  const textFieldRef = useRef(null);

  const handleModalClose = () => {
    if (errorFetchingImage || errorFetchingGeometry) {
      // if there is an error, want to make sure that konva model is set to closed. otherwise, it will 'remain open' and the call to modalHandleClick won't go thru, cause it is useEffect, monitoring changes in konvaModalOpen
      setKonvaModalOpen(false);
      setErrorFetchingImage(false);
      setErrorFetchingGeometry(false);
    }
    setKvpTableAnchorEl(null);
    selectedChiclet.set("");
  };

  const handleManualSelectButtonClick = () => {
    setKonvaModalOpen(true);
    setKvpTableAnchorEl(null);
  };

  const handleSubmit = () => {
    if (textFieldRef === null) {
      console.log("error: textFieldRef null");
      return;
    } else {
      //@ts-ignore
      const inputEl: any = textFieldRef.current.querySelector(
        "#kvp-table-fill-text-input"
      );
      const currentEditedValue = inputEl.value;
      eventTarget.value = currentEditedValue; // fill input w edited val
      setKvpTableAnchorEl(null); // close the modal
      selectedChiclet.set("");

      // only render accuracy score if value was not edited.
      if (
        unalteredKeyValue !== null &&
        //@ts-ignore
        unalteredKeyValue.value === currentEditedValue
      ) {
        // impossible to suppress these ts errors!!!! can run it through an if() statement to make sure it's not null, and ts will still say it's possibly null!!!
        //@ts-ignore
        renderAccuracyScore(eventTarget, unalteredKeyValue);
      } else {
        renderBlankChiclet(eventTarget);
      }
    }
  };

  return (
    <ModalWrapper>
      <CloseButton onClick={handleModalClose}>
        <CloseIcon />
      </CloseButton>
      <DocName id="doc-name-typography" variant="h6">
        {selectedDocData.docName}
      </DocName>
      <TextInputContainer>
        <TextField
          variant="outlined"
          fullWidth
          placeholder={targetString}
          id={"kvp-table-fill-text-input"}
          ref={textFieldRef}
          margin="dense"
        />
      </TextInputContainer>
      <BigButton
        label="Manual Select"
        variant="outlined"
        onClick={handleManualSelectButtonClick}
        style={{ backgroundColor: `${colors.MANUAL_SELECT_BUTTON_YELLOW}` }}
      />
      <BigButton
        label="Submit"
        variant="outlined"
        onClick={handleSubmit}
        style={{ backgroundColor: `${colors.FILL_BUTTON}`, color: "white" }}
      />
      <Collapse in={errorFetchingGeometry || errorFetchingImage}>
        <ErrorLine errorCode={errorCode} msg={errorMessage} />
      </Collapse>
      <Collapse in={messageCollapse}>
        <Message msg={removeKVMessage} />
      </Collapse>
      {areThereKVPairs ? (
        <TableContext.Provider
          value={{
            targetString,
            selectedDocData,
            setRemoveKVMessage,
            setMessageCollapse,
            eventTarget,
            setUnalteredKeyValue,
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
