import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import uuidv from "uuid";

import { useState as useSpecialHookState } from "@hookstate/core";

import { colors } from "../common/colors";
import { ACC_SCORE_LARGE } from "../common/constants";
import { ACC_SCORE_MEDIUM } from "../common/constants";
import { ACC_SCORE_SMALL } from "../common/constants";
import { globalSelectedChiclet } from "../contexts/ChicletSelection";
import { KeyValuesWithDistance } from "./KeyValuePairs";
import WrappedJssComponent from "./ShadowComponent";

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

const greenCircleStyles = makeStyles({ root: { color: "green" } });
const yellowCircleStyles = makeStyles({ root: { color: "goldenrod" } });
const redCircleStyles = makeStyles({ root: { color: "red" } });

const AccuracyScoreEl = ({ value, inputHeight, mounterID }: any) => {
  const selectedChiclet = useSpecialHookState(globalSelectedChiclet);
  const wrapperClasses = wrapperFlexStyles();

  const colorClasses =
    value < 50
      ? redCircleStyles().root
      : value < 80
      ? yellowCircleStyles().root
      : greenCircleStyles().root;

  const size =
    inputHeight >= 30
      ? ACC_SCORE_LARGE
      : inputHeight >= 20
      ? ACC_SCORE_MEDIUM
      : ACC_SCORE_SMALL;

  return (
    <AccuracyScoreBox
      className={wrapperClasses.root}
      onClick={() => selectedChiclet.set(`${mounterID}`)}
      style={
        selectedChiclet.get() === mounterID ? { border: "1px solid black" } : {}
      }
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
        classes={{ colorPrimary: colorClasses }}
      />
    </AccuracyScoreBox>
  );
};

const BlankChiclet = ({ inputHeight, mounterID }: any) => {
  const selectedChiclet = useSpecialHookState(globalSelectedChiclet);
  const wrapperClasses = wrapperFlexStyles();
  const size =
    inputHeight >= 30
      ? ACC_SCORE_LARGE
      : inputHeight >= 20
      ? ACC_SCORE_MEDIUM
      : ACC_SCORE_SMALL;

  return (
    <AccuracyScoreBox
      className={wrapperClasses.root}
      onClick={() => selectedChiclet.set(`${mounterID}`)}
      style={
        selectedChiclet.get() === mounterID ? { border: "1px solid black" } : {}
      }
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

const setMounter = (target: any) => {
  const inputStyle = window.getComputedStyle(target);
  const inputZIndex = target.style.zIndex;
  const positionedParent = target.offsetParent;
  //@ts-ignore
  const mounterID = uuidv();

  // remove the old mounter
  if (target.className.includes("has-docit-mounter")) {
    //@ts-ignore
    const oldMounterClassName = /(has-docit-mounter-(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b))/.exec(
      target.className
    )[0];
    const oldMounterID = oldMounterClassName.replace("has-docit-mounter-", "");
    target.classList.remove(oldMounterClassName);
    document
      .getElementById(`docit-accuracy-score-mounter-${oldMounterID}`)
      ?.remove();

    window.removeEventListener("resize", positionMounter);
  }

  // add the new mounter
  const mounter = document.createElement("span");
  mounter.id = `docit-accuracy-score-mounter-${mounterID}`;
  mounter.style.position = "absolute";

  mounter.style.zIndex =
    inputZIndex !== "" ? `${parseInt(inputZIndex) + 1}` : `${2}`;

  const inputHeight = parseInt(inputStyle.height.replace("px", ""));

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

  function positionMounter() {
    const scopedInputHeight = parseInt(inputStyle.height.replace("px", ""));
    const scopedInputWidth = parseInt(inputStyle.width.replace("px", ""));

    mounter.style.top = `${
      (scopedInputHeight - accuracyScoreElHeight) / 2 + target.offsetTop
    }px`;
    mounter.style.left = `${
      scopedInputWidth + target.offsetLeft - (accuracyScoreElWidth + 5)
    }px`;
  }
  positionMounter();

  window.addEventListener("resize", positionMounter);

  target.className += ` has-docit-mounter-${mounterID}`;

  positionedParent.appendChild(mounter);

  return { mounter, mounterID };
};

export const renderAccuracyScore = (
  target: any,
  keyValue: KeyValuesWithDistance
) => {
  const { mounter, mounterID } = setMounter(target);
  const inputHeight = parseInt(
    window.getComputedStyle(target).height.replace("px", "")
  );

  ReactDOM.render(
    <AccuracyScoreEl
      //@ts-ignore
      value={keyValue.distanceFromTarget * 100}
      inputHeight={inputHeight}
      mounterID={mounterID}
    />,
    mounter
  );
};

export const renderBlankChiclet = (target: any) => {
  const { mounter, mounterID } = setMounter(target);
  const inputHeight = parseInt(
    window.getComputedStyle(target).height.replace("px", "")
  );

  ReactDOM.render(
    <BlankChiclet inputHeight={inputHeight} mounterID={mounterID} />,
    mounter
  );
};
