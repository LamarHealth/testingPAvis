import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import $ from "jquery";

import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import uuidv from "uuid";

import { colors } from "../common/colors";
import { ACC_SCORE_LARGE } from "../common/constants";
import { ACC_SCORE_MEDIUM } from "../common/constants";
import { ACC_SCORE_SMALL } from "../common/constants";
import { useStore } from "../contexts/ZustandStore";
import {
  KeyValuesWithDistance,
  KeyValuesByDoc,
  getEditDistanceAndSort,
} from "./KeyValuePairs";
import {
  assignTargetString,
  handleFreightTerms,
} from "./libertyInputsDictionary";
import WrappedJssComponent from "./ShadowComponent";

export enum PopulateFormsActionTypes {
  blankChiclets = "blank chiclets",
  bestGuess = "best guess",
}

export enum RenderAccuracyScoreActionTypes {
  blank = "blank",
  value = "value",
}

const AccuracyScoreBox = styled.div`
  background: ${colors.ACCURACY_SCORE_LIGHTBLUE};
  padding: 4px;
  border-radius: 5px;
`;

const StyledCircularProgress = styled(CircularProgress)`
  position: relative;
`;

const wrapperFlexStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(0.5),
    },
  },
}));

const greenCircleStyles = makeStyles({ colorPrimary: { color: "green" } });
const yellowCircleStyles = makeStyles({ colorPrimary: { color: "goldenrod" } });
const redCircleStyles = makeStyles({ colorPrimary: { color: "red" } });

//// COMPONENTS ////
const AccuracyScoreEl = ({ value, inputHeight, mounterID }: any) => {
  const [
    selectedChiclet,
    setSelectedChiclet,
    setEventTarget,
    setTargetString,
    setKvpTableAnchorEl,
  ] = [
    useStore((state) => state.selectedChiclet),
    useStore((state) => state.setSelectedChiclet),
    useStore((state) => state.setEventTarget),
    useStore((state) => state.setTargetString),
    useStore((state) => state.setKvpTableAnchorEl),
  ];

  const wrapperClasses = wrapperFlexStyles();

  const colorClasses =
    value < 50
      ? redCircleStyles()
      : value < 80
      ? yellowCircleStyles()
      : greenCircleStyles();

  const size =
    inputHeight >= 30
      ? ACC_SCORE_LARGE
      : inputHeight >= 20
      ? ACC_SCORE_MEDIUM
      : ACC_SCORE_SMALL;

  const handleClick = () => {
    setSelectedChiclet(mounterID);
    const eventTarget = document.querySelector(
      `input.has-docit-mounter-${mounterID}`
    ) as HTMLInputElement;
    setEventTarget(eventTarget);
    setTargetString(assignTargetString(eventTarget));
    setKvpTableAnchorEl(eventTarget);
  };

  return (
    <AccuracyScoreBox
      className={wrapperClasses.root}
      onClick={handleClick}
      style={selectedChiclet === mounterID ? { border: "1px solid black" } : {}}
    >
      <Box>
        <WrappedJssComponent wrapperClassName={"shadow-root-for-chiclets"}>
          <style>
            {`* {font-family: Roboto, Helvetica, Arial, sans-serif; color: ${colors.FONT_BLUE}; font-size: ${size}px; font-weight: 400; line-height: 1em;}`}
          </style>
          <Typography
            variant="caption"
            component="div"
            color="textSecondary"
          >{`${Math.round(value)}%`}</Typography>
        </WrappedJssComponent>
      </Box>
      <StyledCircularProgress
        variant="static"
        value={value}
        color={"primary"}
        size={`${size}px`}
        thickness={10}
        classes={colorClasses}
      />
    </AccuracyScoreBox>
  );
};

const BlankChiclet = ({ inputHeight, mounterID }: any) => {
  const [
    selectedChiclet,
    setSelectedChiclet,
    setEventTarget,
    setTargetString,
    setKvpTableAnchorEl,
  ] = [
    useStore((state) => state.selectedChiclet),
    useStore((state) => state.setSelectedChiclet),
    useStore((state) => state.setEventTarget),
    useStore((state) => state.setTargetString),
    useStore((state) => state.setKvpTableAnchorEl),
  ];

  const wrapperClasses = wrapperFlexStyles();

  const size =
    inputHeight >= 30
      ? ACC_SCORE_LARGE
      : inputHeight >= 20
      ? ACC_SCORE_MEDIUM
      : ACC_SCORE_SMALL;

  const handleClick = () => {
    setSelectedChiclet(mounterID);
    const eventTarget = document.querySelector(
      `input.has-docit-mounter-${mounterID}`
    ) as HTMLInputElement;
    setEventTarget(eventTarget);
    setTargetString(assignTargetString(eventTarget));
    setKvpTableAnchorEl(eventTarget);
  };

  return (
    <AccuracyScoreBox
      className={wrapperClasses.root}
      onClick={handleClick}
      style={selectedChiclet === mounterID ? { border: "1px solid black" } : {}}
    >
      <Box>
        <WrappedJssComponent wrapperClassName={"shadow-root-for-chiclets"}>
          <style>
            {`* {font-family: Roboto, Helvetica, Arial, sans-serif; color: ${colors.FONT_BLUE}; font-size: ${size}px; font-weight: 400; line-height: 1em;}`}
          </style>
          <Typography
            variant="caption"
            component="div"
            color="textSecondary"
            style={{ marginLeft: `${size}px`, marginRight: `${size}px` }}
          >
            {"?"}
          </Typography>
        </WrappedJssComponent>
      </Box>
    </AccuracyScoreBox>
  );
};

//// FUNCTIONS ////
const getComputedStyle = (target: HTMLElement): CSSStyleDeclaration =>
  window.getComputedStyle(target);

const getComputedDimension = (
  style: CSSStyleDeclaration,
  dimension: "height" | "width"
): number => {
  switch (dimension) {
    case "height":
      return parseInt(style.height.replace("px", ""));
    case "width":
      return parseInt(style.width.replace("px", ""));
  }
};

const hasDocitMounter = (target: HTMLElement): boolean =>
  target.className.includes("has-docit-mounter");

const findAccuracyScoreElDimensions = (
  inputHeight: number
): { accuracyScoreElHeight: number; accuracyScoreElWidth: number } => {
  const accuracyScoreElHeight =
    inputHeight >= 30
      ? ACC_SCORE_LARGE + 8
      : inputHeight >= 20
      ? ACC_SCORE_MEDIUM + 8
      : ACC_SCORE_SMALL + 8;
  const accuracyScoreElWidth =
    inputHeight >= 30
      ? ACC_SCORE_LARGE + 40
      : inputHeight >= 20
      ? ACC_SCORE_MEDIUM + 32
      : ACC_SCORE_SMALL + 26;

  return { accuracyScoreElHeight, accuracyScoreElWidth };
};

const removeMounter = (target: HTMLElement): void => {
  if (hasDocitMounter(target)) {
    //@ts-ignore
    const oldMounterClassName = /(has-docit-mounter-(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b))/.exec(
      target.className
    )[0];
    const oldMounterID = oldMounterClassName.replace("has-docit-mounter-", "");
    const oldMounter = document.getElementById(
      `docit-accuracy-score-mounter-${oldMounterID}`
    ) as HTMLElement;

    ReactDOM.unmountComponentAtNode(oldMounter); // unmount React component from old mounter
    target.classList.remove(oldMounterClassName); // remove old class name from targeted inputEl
    oldMounter.remove(); // remove mounter from DOM
  }
};

function positionMounter(
  target: HTMLElement,
  inputStyle: CSSStyleDeclaration,
  mounter: HTMLSpanElement,
  accuracyScoreElHeight: number,
  accuracyScoreElWidth: number
): void {
  const scopedInputHeight = getComputedDimension(inputStyle, "height");
  const scopedInputWidth = getComputedDimension(inputStyle, "width");

  mounter.style.top = `${
    (scopedInputHeight - accuracyScoreElHeight) / 2 + target.offsetTop
  }px`;
  mounter.style.left = `${
    scopedInputWidth + target.offsetLeft - (accuracyScoreElWidth + 5)
  }px`;
}

function positionAllMounters() {
  $(document).ready(function () {
    $("input").each(function () {
      if (this.offsetParent) {
        const inputStyle = getComputedStyle(this);
        const inputHeight = getComputedDimension(inputStyle, "height");
        const mounter = hasDocitMounter(this)
          ? (Array.from(this.offsetParent?.children).filter((el) =>
              el.id.includes("docit-accuracy-score-mounter")
            )[0] as HTMLSpanElement)
          : undefined;
        const {
          accuracyScoreElHeight,
          accuracyScoreElWidth,
        } = findAccuracyScoreElDimensions(inputHeight);
        if (mounter) {
          positionMounter(
            this,
            inputStyle,
            mounter,
            accuracyScoreElHeight,
            accuracyScoreElWidth
          );
        }
      }
    });
  });
}

const setMounter = (target: HTMLElement) => {
  const inputStyle = getComputedStyle(target);
  const inputHeight = getComputedDimension(inputStyle, "height");
  const inputZIndex = target.style.zIndex;
  const {
    accuracyScoreElHeight,
    accuracyScoreElWidth,
  } = findAccuracyScoreElDimensions(inputHeight);
  const positionedParent = target.offsetParent;
  const mounter = document.createElement("span");
  //@ts-ignore
  const mounterID = uuidv();

  // remove the old mounter
  removeMounter(target);

  // add the new mounter
  mounter.id = `docit-accuracy-score-mounter-${mounterID}`;
  mounter.style.position = "absolute";
  mounter.style.zIndex =
    inputZIndex !== "" ? `${parseInt(inputZIndex) + 1}` : `${2}`;
  positionMounter(
    target,
    inputStyle,
    mounter,
    accuracyScoreElHeight,
    accuracyScoreElWidth
  );
  target.className += ` has-docit-mounter-${mounterID}`; // add class to link to chiclet
  positionedParent && positionedParent.appendChild(mounter); // append mounter

  return { mounter, mounterID };
};

export const renderAccuracyScore = (
  action: "value" | "blank",
  target: HTMLElement,
  keyValue?: KeyValuesWithDistance
) => {
  if (target.offsetParent) {
    const { mounter, mounterID } = setMounter(target);
    const inputHeight = getComputedDimension(
      getComputedStyle(target),
      "height"
    );
    switch (action) {
      case "value":
        ReactDOM.render(
          <AccuracyScoreEl
            //@ts-ignore
            value={keyValue.distanceFromTarget * 100}
            inputHeight={inputHeight}
            mounterID={mounterID}
          />,
          mounter
        );
        break;
      case "blank":
        ReactDOM.render(
          <BlankChiclet inputHeight={inputHeight} mounterID={mounterID} />,
          mounter
        );
        break;
      default:
        throw new Error();
    }
  }
};

export const populateForms = (
  docID: string,
  action: "blank chiclets" | "best guess",
  docData?: KeyValuesByDoc[]
): void => {
  $(document).ready(() => {
    switch (action) {
      case "best guess":
        if (docData) {
          const keyValuePairs = docData.filter(
            (doc: KeyValuesByDoc) => doc.docID === docID
          )[0];
          $("select").each(function () {
            handleFreightTerms(this, keyValuePairs);
          });
          $("input").each(function () {
            const targetString = assignTargetString(this);
            if (typeof targetString !== "undefined") {
              const areThereKVPairs =
                Object.keys(keyValuePairs.keyValuePairs).length > 0
                  ? true
                  : false;
              if (areThereKVPairs) {
                const sortedKeyValuePairs = getEditDistanceAndSort(
                  keyValuePairs,
                  targetString,
                  "lc substring"
                );
                if (
                  sortedKeyValuePairs[0].distanceFromTarget > 0.5 &&
                  sortedKeyValuePairs[0].value !== ""
                ) {
                  renderAccuracyScore(
                    RenderAccuracyScoreActionTypes.value,
                    this,
                    sortedKeyValuePairs[0]
                  );
                  $(this).prop("value", sortedKeyValuePairs[0]["value"]);
                } else {
                  renderAccuracyScore(
                    RenderAccuracyScoreActionTypes.blank,
                    this
                  );
                  $(this).prop("value", null);
                }
              }
            }
          });
        } else throw new Error();
        break;
      case "blank chiclets":
        $("input").each(function () {
          renderAccuracyScore(RenderAccuracyScoreActionTypes.blank, this);
        });
        break;
      default:
        throw new Error();
    }
    window.addEventListener("resize", positionAllMounters); // no need remove listener, as identical listeners are automatically discarded
  });
};

export const removeAllChiclets = () => {
  $(document).ready(function () {
    $("input").each(function () {
      removeMounter(this);
    });
  });
};
