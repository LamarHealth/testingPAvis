import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import uuidv from "uuid";

import { colors } from "./../common/colors";
import { KeyValuesWithDistance } from "./KeyValuePairs";
import WrappedJssComponent from "./ShadowComponent";

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
  }

  // add the new mounter
  const mounter = document.createElement("span");
  mounter.id = `docit-accuracy-score-mounter-${mounterID}`;
  mounter.style.position = "absolute";
  mounter.style.left = `${
    parseInt(inputStyle.width.replace("px", "")) + target.offsetLeft - 25
  }px`;
  mounter.style.top = `${
    parseInt(inputStyle.height.replace("px", "")) + target.offsetTop - 60
  }px`;
  mounter.style.zIndex =
    inputZIndex !== "" ? `${parseInt(inputZIndex) + 1}` : `${2}`;
  target.className += ` has-docit-mounter-${mounterID}`;

  positionedParent.appendChild(mounter);

  ReactDOM.render(
    //@ts-ignore
    <AccuracyScoreEl value={keyValue.distanceFromTarget * 100} />,
    mounter
  );
};
