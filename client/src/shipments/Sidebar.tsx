/*global chrome*/
import React, { useState } from "react";
import { colors } from "./../common/colors";
import { SIDEBAR_WIDTH } from "./../common/constants";
import styled from "styled-components";
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
  height: 100%;
  transition: all 1s;
  width: ${SIDEBAR_WIDTH};
  background-color: ${colors.OFFWHITE};
  overflow: auto;
`;

const Container = styled.div`
  position: fixed;
  display: flex;
  height: 90%;
  z-index: 9999;
  transition: 1s;
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
  opacity: ${(props: { open: boolean }) => (props.open ? 1 : 0.4)};
  border: none;
  border-radius: 0% 25% 25% 0%;

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
  if (process.env.REACT_APP_LOCAL !== "local") {
    chrome.runtime.onMessage.addListener(function (request) {
      if (request.message == "open sesame") {
        setOpen(!isOpen);
      }
    });
  }

  return (
    <WrappedJssComponent>
      <Container open={isOpen}>
        <Column open={isOpen}>
          <DocViewer />
        </Column>
        <ExpandButton onClick={() => setOpen(!isOpen)} open={isOpen}>
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </ExpandButton>
      </Container>
    </WrappedJssComponent>
  );
};
