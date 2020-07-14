import React, { useState, createContext, useContext, useEffect } from "react";

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
import Typography from "@material-ui/core/Typography";

import { colors } from "../common/colors";
import { constants } from "../common/constants";
import { ManualSelect } from "./ManualSelect";
import {
  getKeyValuePairsByDoc,
  getLevenDistanceAndSort,
  sortKeyValuePairs,
  KeyValuesWithDistance,
} from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";
import { DropdownContext } from "./RenderModal";

const modalWrapperStyles = {
  backgroundColor: `${colors.DROPDOWN_TABLE_BACKGROUND_GREEN}`,
  border: "1px solid lightgrey",
  zIndex: 2,
  maxHeight: "500px",
  overflowX: "hidden",
  overflowY: "scroll",
  width: `${constants.MODAL_WIDTH}px`,
};

const fillButtonStyles = {
  backgroundColor: `${colors.FILL_BUTTON}`,
  color: "white",
  border: "1px solid white",
  borderRadius: "5px",
  width: "4em",
  height: "2em",
  fontWeight: "bold",
};

const closestMatchStyles = {
  padding: 0,
  width: "6.5em",
  border: "none",
  backgroundColor: `${colors.TRANSPARENT}`,
  textAlign: "left",
};

const arrowIconStyles = {
  width: "2em",
  height: "2em",
};

const iconButtonStyles = {
  border: "none",
  backgroundColor: "transparent",
  margin: 0,
  padding: 0,
};

const FillBttnContext = createContext({} as any);

const FillButton = () => {
  const [fillBttnHover, setFillBttnHover] = useState({}) as any;
  const { setModalAnchorEl } = useContext(DropdownContext);
  const fillButtonHandler = useContext(FillBttnContext);
  return (
    <button
      //@ts-ignore
      style={{ ...fillButtonStyles, ...fillBttnHover }}
      onMouseEnter={() => setFillBttnHover({ opacity: 0.5 })}
      onMouseLeave={() => setFillBttnHover({ opacity: 1 })}
      onClick={() => {
        setModalAnchorEl(null);
        fillButtonHandler();
      }}
    >
      Fill
    </button>
  );
};

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
                <button
                  //@ts-ignore
                  style={closestMatchStyles}
                >
                  <Typography>
                    <i>closest match</i>
                  </Typography>
                </button>
              )}
            </TableCell>
            <TableCell>
              <Typography>{keyValue["key"]}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{keyValue["value"]}</Typography>
            </TableCell>
            <TableCell>
              <FillBttnContext.Provider value={fillButtonHandler}>
                <FillButton />
              </FillBttnContext.Provider>
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
          <IconButton
            onClick={matchScoreSortHandler}
            //@ts-ignore
            style={iconButtonStyles}
          >
            <table>
              <tr>
                <td>
                  {matchArrow === "highest match" ? (
                    <ArrowDropDownIcon style={arrowIconStyles} />
                  ) : (
                    <ArrowDropUpIcon style={arrowIconStyles} />
                  )}
                </td>
                <Typography variant="h4">
                  <td>Match Score</td>
                </Typography>
              </tr>
            </table>
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton
            onClick={alphabeticSortHandler}
            //@ts-ignore
            style={iconButtonStyles}
          >
            <table>
              <tr>
                <td>
                  {alphabetArrow === "a-to-z" ? (
                    <ArrowDropDownIcon style={arrowIconStyles} />
                  ) : (
                    <ArrowDropUpIcon style={arrowIconStyles} />
                  )}
                </td>
                <td>
                  <Typography variant="h4">
                    Field Name: <i>{targetString}</i>
                  </Typography>
                </td>
              </tr>
            </table>
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="h4">Field Value</Typography>
        </TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

export const Modal = (props: { eventObj: any }) => {
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

  // rewriting pesky styles that penetrate the shadow DOM
  const rewriteStyles = () => {
    const popoverEl = document.getElementById("docit-modal");
    const shadowRoot = popoverEl?.children[2].children[0].shadowRoot;
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
    <div
      id={`modal-wrapper`}
      //@ts-ignore
      style={modalWrapperStyles}
    >
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
        <TableBodyComponent
          sortedKeyValuePairs={sortKeyValuePairs(sortedKeyValuePairs, sort)}
          eventObj={eventObj}
          bestMatch={bestMatch}
        />
      </Table>
    </div>
  );
};
