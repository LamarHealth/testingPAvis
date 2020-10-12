import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import { colors } from "../../common/colors";
import {
  ACC_SCORE_LARGE,
  ACC_SCORE_SMALL,
  ACC_SCORE_MEDIUM,
} from "../../common/constants";
import {
  replaceAndSetNewMounter,
  getComputedDimension,
  GetComputedDimensionActionTypes,
} from "./functions";
import { useStore } from "../../contexts/ZustandStore";
import { KeyValuesWithDistance } from "../KeyValuePairs";
import { assignTargetString } from "../libertyInputsDictionary";
import WrappedJssComponent from "../ShadowComponent";

export enum RenderAccuracyScoreActionTypes {
  blank,
  value,
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

export const renderAccuracyScore = (
  action: RenderAccuracyScoreActionTypes,
  target: HTMLElement,
  keyValue?: KeyValuesWithDistance
) => {
  if (target.offsetParent) {
    const { mounter, mounterID } = replaceAndSetNewMounter(target);
    const inputHeight = getComputedDimension(
      getComputedStyle(target),
      GetComputedDimensionActionTypes.height
    );
    switch (action) {
      case RenderAccuracyScoreActionTypes.value:
        if (keyValue) {
          ReactDOM.render(
            <AccuracyScoreEl
              value={keyValue.distanceFromTarget * 100}
              inputHeight={inputHeight}
              mounterID={mounterID}
            />,
            mounter
          );
        }
        break;
      case RenderAccuracyScoreActionTypes.blank:
        ReactDOM.render(
          <BlankChiclet inputHeight={inputHeight} mounterID={mounterID} />,
          mounter
        );
        break;
    }
  }
};
