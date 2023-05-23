import React, { useState, createContext, useContext, useEffect } from "react";

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
import VisibilityIcon from "@material-ui/icons/Visibility";

import { colors } from "../common/colors";
import {
  getKeyValuePairsByDoc,
  getEditDistanceAndSort,
  sortKeyValuePairs,
  KeyValuesWithDistance,
  deleteKVPairFromLocalStorage,
} from "./KeyValuePairs";

import { useStore, State } from "../contexts/ZustandStore";
import { DocumentInfo, Line } from "../../../types/documents";

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

interface TableContextProps {
  matchArrow: string;
  matchScoreSortHandler: () => void;
  alphabetArrow: string;
  alphabeticSortHandler: () => void;
}

const TableHeadContext = createContext({} as TableContextProps);

const TableHeadComponent = () => {
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

const ButtonsCell = (props: { keyValue: KeyValuesWithDistance }) => {
  const {
    selectedDocData,
    setRemoveKVMessage,
    setMessageCollapse,
    setUnalteredKeyValue,
    inputRef,
  } = useContext(TableContext);

  // Fill polygon line in modal when text is selected
  const [lines, setDocData, setKonvaModalOpen, setSelectedLines] = [
    useStore((state: State) => state.lines),
    useStore((state: State) => state.setDocData),
    useStore((state: State) => state.setKonvaModalOpen),
    useStore((state: State) => state.setSelectedLines),
  ];
  const [softCollapse, setSoftCollapse] = useState(false);
  const [hardCollapse, setHardCollapse] = useState(false);
  const keyValue = props.keyValue;
  const fillCurrentSelection = () => {
    // Fetch geometry of lines from docdata from server
    // TODO: change line geometry so only the selected line is returned
    console.log("running search for ", keyValue["value"], "in", lines);
    const keySearch = lines.find((line) =>
      line.Text.includes(keyValue["value"])
    );
    const lineGeometry = keySearch ? [keySearch] : [];

    console.log("filling");
    setSelectedLines(lineGeometry);
    // open modal
    setKonvaModalOpen(true);
  };

  const fillButtonHandler = () => {
    if (inputRef.current) {
      inputRef.current.value = keyValue["value"]; // fill the kvp table input
      setUnalteredKeyValue(keyValue); // let the parent component know what the original string is
      inputRef.current.focus(); // focus on the text editor
    }
  };

  const reportKVPair = async (remove: boolean = false) => {
    if (remove) {
      await deleteKVPairFromLocalStorage(
        selectedDocData.docID,
        keyValue["key"],
        keyValue["value"]
      );
    }

    const keyValuesByDoc = await getKeyValuePairsByDoc();
    setDocData(keyValuesByDoc);
    setHardCollapse(true);
    setSoftCollapse(false);

    // TODO: Create new reporting system for key value pairs
    setRemoveKVMessage(
      "The faulty key / value pair has been removed from your browser, but we are unable to pass this note on to the server at this time."
    );

    // set message
    setMessageCollapse(true);
  };

  // Handle drawing highlights
  // After the geometry is loaded, update the filled polygon

  // cleanup
  useEffect(() => {
    setHardCollapse(false);
    const closeMessage = setTimeout(() => setMessageCollapse(false), 5000);
    return () => clearTimeout(closeMessage);
  }, [hardCollapse, setMessageCollapse]);

  return (
    <>
      <Collapse in={!softCollapse} timeout={hardCollapse ? 0 : "auto"}>
        <FlexCell>
          <IconButton onClick={() => fillCurrentSelection()}>
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
          <span style={{ display: "flex" }}>
            <Chip
              label="Report Unrelated"
              variant="outlined"
              onClick={() => reportKVPair()}
              style={{ margin: "0.5em" }}
            />
            <Chip
              label="Delete Row"
              variant="outlined"
              onClick={() => reportKVPair(true)}
              style={{ margin: "0.5em" }}
            />
          </span>
        </Collapse>
      </ClickAwayListener>
    </>
  );
};

const TableRowContext = createContext(
  {} as {
    selectedRow: number | null;
    setSelectedRow: React.Dispatch<React.SetStateAction<number | null>>;
  }
);

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
      </StyledTableCellMiddle>
      <StyledTableCellMiddle>
        <Typography>{keyValue["value"]}</Typography>
      </StyledTableCellMiddle>
      <StyledTableCellRight>
        <ButtonsCell keyValue={keyValue} />
      </StyledTableCellRight>
    </TableRow>
  );
};

export const TableContext = createContext({} as any);

interface TableComponentProps {
  document: DocumentInfo;
}
export const TableComponent = ({ document }: TableComponentProps) => {
  const targetString = useStore((state: State) => state.targetString);
  const sortedKeyValuePairs = getEditDistanceAndSort(
    document.keyValuePairs,
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
        <TableHeadComponent />
      </TableHeadContext.Provider>
      <TableBody>
        {dynamicallySortedKeyValuePairs.map(
          (keyValue: KeyValuesWithDistance, i: number) => (
            <TableRowComponent
              keyValue={keyValue}
              bestMatch={bestMatch}
              i={i}
              key={i}
            />
          )
        )}
      </TableBody>
    </Table>
  );
};
