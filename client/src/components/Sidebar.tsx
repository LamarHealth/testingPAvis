/*global chrome*/
import React, { useState } from "react";
import { colors } from "../common/colors";
import {
  SIDEBAR_WIDTH,
  SIDEBAR_TRANSITION_TIME,
  LOCAL_MODE,
} from "../common/constants";
import styled from "styled-components";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";

import DocViewer from "./DocViewer";
import WrappedJssComponent from "./ShadowComponent";

const Column = styled.div`
  justify-content: flex-start;
  flex-direction: column;
  align-items: stretch;
  margin: 1em 0em;
  border: ${(props: { open: boolean }) =>
    props.open
      ? `1px solid ${colors.LAYOUT_BLUE_SOLID}`
      : `1px solid ${colors.LAYOUT_BLUE_CLEAR}`};
  border-radius: 10px;
  display: flex;
  opacity: ${(props: { open: boolean }) => (props.open ? 1 : 0)};
  height: 100%;
  transition: all ${SIDEBAR_TRANSITION_TIME};
  width: ${SIDEBAR_WIDTH};
  background-color: ${colors.OFFWHITE};
  overflow: auto;
`;

const Container = styled.div`
  position: fixed;
  display: flex;
  height: 90%;
  z-index: 9999;
  transition: ${SIDEBAR_TRANSITION_TIME};
  margin-left: ${(props: { open: boolean }) =>
    props.open ? "0" : "-" + SIDEBAR_WIDTH};
`;

const ExpandButton = styled.button`
  position: relative;
  width: 2em;
  height: 3em;
  top: 50%;
  right: 1em;
  margin: 0em 0em 0em 1em;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.LAYOUT_BLUE_SOLID};
  color: ${colors.WHITE};
  opacity: ${(props: { open: boolean }) => (props.open ? 0 : 1)};
  border: none;
  border-radius: 0% 25% 25% 0%;
  transition: all ${SIDEBAR_TRANSITION_TIME} ease-in;

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: none;
  }
`;

export const Sidebar = () => {
  const [isOpen, setOpen] = useState(false);

  // open the sidebar if extension icon clicked
  if (!LOCAL_MODE) {
    const callback = function (request: any) {
      if (request.message === "open sesame") {
        chrome.runtime.onMessage.removeListener(callback);
        setOpen(!isOpen);
      }
    };
    chrome.runtime.onMessage.addListener(callback);
  }

  // handle click away
  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <WrappedJssComponent wrapperClassName={"shadow-root-for-sidebar"}>
      <Container open={isOpen} id="the-container">
        <ClickAwayListener
          mouseEvent={isOpen ? "onMouseDown" : false}
          touchEvent={isOpen ? "onTouchStart" : false}
          onClickAway={handleClickAway}
        >
          <Column open={isOpen}>
            <DocViewer />
          </Column>
        </ClickAwayListener>
        <ExpandButton onClick={() => setOpen(!isOpen)} open={isOpen}>
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </ExpandButton>
      </Container>
    </WrappedJssComponent>
  );
};
