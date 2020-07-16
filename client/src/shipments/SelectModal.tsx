import React, { useState, createContext, useContext, useEffect } from "react";
import ReactDOM from "react-dom";

import { useState as useSpecialHookState } from "@hookstate/core";
import uuidv from "uuid";

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
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";

import { colors } from "../common/colors";
import { MODAL_WIDTH } from "../common/constants";
import { ManualSelect } from "./ManualSelect";
import {
  getKeyValuePairsByDoc,
  getLevenDistanceAndSort,
  sortKeyValuePairs,
  KeyValuesWithDistance,
} from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";
import { ModalContext } from "./RenderModal";
import WrappedJssComponent from "./ShadowComponent";

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

const AccuracyScoreBox = styled(Box)`
  background: ${colors.DROPZONE_BACKGROUND_HOVER_LIGHTBLUE};
  padding: 5px;
  border-radius: 7px;
  opacity: 0.5;

  :hover {
    opacity: 1;
  }
`;

const AccuracyScoreEl = ({ value }: any) => {
  return (
    <AccuracyScoreBox display="inline-flex">
      <CircularProgress
        variant="static"
        value={value}
        color={value > 75 ? "primary" : "secondary"}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <WrappedJssComponent>
          <style>
            {`* {font-family: Roboto, Helvetica, Arial, sans-serif; color: ${colors.FONT_BLUE}; font-size: 14px; font-weight: 400}`}
          </style>
          <Typography
            variant="caption"
            component="div"
            color="textSecondary"
          >{`${Math.round(value)}%`}</Typography>
        </WrappedJssComponent>
      </Box>
    </AccuracyScoreBox>
  );
};

const TableBodyComponent = (props: {
  sortedKeyValuePairs: KeyValuesWithDistance[];
  eventObj: any;
  bestMatch: string;
}) => {
  const { setMainModalOpen } = useContext(ModalContext);
  const eventObj = props.eventObj;

  return (
    <TableBody>
      {props.sortedKeyValuePairs.map((keyValue: any, i: number) => {
        const renderAccuracyScore = () => {
          const input = eventObj.target;
          const inputStyle = window.getComputedStyle(eventObj.target);
          const inputZIndex = input.style.zIndex;
          const positionedParent = input.offsetParent;
          //@ts-ignore
          const mounterID = uuidv();

          // remove the old mounter
          if (input.className.includes("has-docit-mounter")) {
            //@ts-ignore
            const oldMounterClassName = /(has-docit-mounter-(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b))/.exec(
              input.className
            )[0];
            const oldMounterID = oldMounterClassName.replace(
              "has-docit-mounter-",
              ""
            );
            input.classList.remove(oldMounterClassName);
            document
              .getElementById(`docit-accuracy-score-mounter-${oldMounterID}`)
              ?.remove();
          }

          // add the new mounter
          const mounter = document.createElement("span");
          mounter.id = `docit-accuracy-score-mounter-${mounterID}`;
          mounter.style.position = "absolute";
          mounter.style.left = `${
            parseInt(inputStyle.width.replace("px", "")) + input.offsetLeft - 25
          }px`;
          mounter.style.top = `${
            parseInt(inputStyle.height.replace("px", "")) + input.offsetTop - 60
          }px`;
          mounter.style.zIndex =
            inputZIndex !== "" ? `${parseInt(inputZIndex) + 1}` : `${2}`;
          input.className += ` has-docit-mounter-${mounterID}`;

          positionedParent.appendChild(mounter);

          ReactDOM.render(
            <AccuracyScoreEl value={keyValue.distanceFromTarget * 100} />,
            mounter
          );
        };

        const fillButtonHandler = () => {
          props.eventObj.target.value = keyValue["value"];
          setMainModalOpen(false);
          renderAccuracyScore();
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
              <FillButton onClick={fillButtonHandler}>Fill</FillButton>
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
        <TableBodyComponent
          sortedKeyValuePairs={sortKeyValuePairs(sortedKeyValuePairs, sort)}
          eventObj={eventObj}
          bestMatch={bestMatch}
        />
      </Table>
    </ModalWrapper>
  );
};
