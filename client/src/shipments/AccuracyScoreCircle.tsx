import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import uuidv from "uuid";

import { colors } from "./../common/colors";
import { KeyValuesWithDistance } from "./KeyValuePairs";
import WrappedJssComponent from "./ShadowComponent";

const AccuracyScoreBox = styled.div`
  background: ${colors.ACCURACY_SCORE_LIGHTBLUE};
  padding: 3px;
  border-radius: 5px;
`;

const StyledCircularProgress = styled(CircularProgress)`
  position: relative;
  top: 2px;
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

const AccuracyScoreEl = ({ value }: any) => {
  const wrapperClasses = wrapperFlexStyles();

  const colorClasses =
    value < 50
      ? redCircleStyles().root
      : value < 80
      ? yellowCircleStyles().root
      : greenCircleStyles().root;

  return (
    <AccuracyScoreBox className={wrapperClasses.root}>
      <Box>
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
      <StyledCircularProgress
        variant="static"
        value={value}
        color={"primary"}
        size={"14px"}
        thickness={10}
        classes={{ colorPrimary: colorClasses }}
      />
    </AccuracyScoreBox>
  );
};

export const renderAccuracyScore = (
  target: any,
  keyValue: KeyValuesWithDistance
) => {
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

  function positionMounter() {
    console.log(mounter.style.height);

    mounter.style.top = `${
      (parseInt(inputStyle.height.replace("px", "")) - 23) / 2 +
      target.offsetTop
    }px`;
    mounter.style.left = `${
      parseInt(inputStyle.width.replace("px", "")) + target.offsetLeft - 56
    }px`;
    console.log("hi");
  }
  positionMounter();

  window.addEventListener("resize", positionMounter);

  target.className += ` has-docit-mounter-${mounterID}`;

  positionedParent.appendChild(mounter);

  ReactDOM.render(
    //@ts-ignore
    <AccuracyScoreEl value={keyValue.distanceFromTarget * 100} />,
    mounter
  );
};
