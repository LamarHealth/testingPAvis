/*global chrome*/
import React, { useState, useEffect } from "react";
import { colors } from "../common/colors";
import {
  SIDEBAR_WIDTH,
  SIDEBAR_HEIGHT,
  SIDEBAR_TRANSITION_TIME,
  LOCAL_MODE,
  MODAL_SHADOW,
} from "../common/constants";
import styled from "styled-components";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

import DocViewer from "./DocViewer";
import WrappedJssComponent from "./ShadowComponent";

const Column = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: stretch;
  margin: 1em 1em 0 0;
  border: ${(props: { open: boolean }) =>
    props.open
      ? `1px solid ${colors.DOC_CARD_BORDER};`
      : `1px solid ${colors.LAYOUT_BLUE_CLEAR}`};
  border-radius: 10px;
  box-shadow: ${MODAL_SHADOW};
  opacity: ${(props: { open: boolean }) => (props.open ? 1 : 0)};
  height: ${SIDEBAR_HEIGHT};
  max-height: 100%;
  transition: all ${SIDEBAR_TRANSITION_TIME};
  width: ${SIDEBAR_WIDTH};
  background-color: ${colors.SIDEBAR_BACKGROUND};
  overflow: auto;
`;

const Container = styled.div`
  position: fixed;
  z-index: 9999;
  transition: ${SIDEBAR_TRANSITION_TIME};
  margin-top: ${(props: { open: boolean }) =>
    props.open
      ? "0"
      : "-" + (parseInt(SIDEBAR_HEIGHT.replace("em", "")) + 1) + "em"};
  top: 0;
  right: 0;
`;

const ExpandButton = styled.button`
  position: relative;
  width: 3.5em;
  height: 2em;
  left: ${SIDEBAR_WIDTH};
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.LAYOUT_BLUE_SOLID};
  color: ${colors.WHITE};
  opacity: ${(props: { open: boolean }) => (props.open ? 0 : 1)};
  border: none;
  border-radius: 0% 0% 25% 25%;
  transition: ${(props: { open: boolean }) =>
    props.open
      ? `all ${SIDEBAR_TRANSITION_TIME} ease-out`
      : `all ${SIDEBAR_TRANSITION_TIME} ease-in`};

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
  useEffect(() => {
    if (!LOCAL_MODE) {
      const callback = function (request: any) {
        if (request.message === "open sidebar") {
          setOpen((prev) => !prev);
        }
      };
      chrome.runtime.onMessage.addListener(callback);
      return () => chrome.runtime.onMessage.removeListener(callback);
    }
  }, [setOpen]);

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
          {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </ExpandButton>
      </Container>
    </WrappedJssComponent>
  );
};
