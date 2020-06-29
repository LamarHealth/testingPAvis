import React, { useReducer, useState, createContext, useContext } from "react";
import { colors } from "./../common/colors";
import styled from "styled-components";
import { Icon, Button, Popover, Menu, Position } from "@blueprintjs/core";

const Column = styled.div`
  justify-content: flex-start;
  flex-direction: column;
  align-items: stretch;
  margin: 1em 0em;
  border: ${(props: { open: boolean }) =>
    props.open
      ? `1px solid ${colors.LAYOUT_BLUE_CLEAR}`
      : `1px solid ${colors.LAYOUT_BLUE_SOLID}`};
  border-radius: 10px;
  display: flex;
  height: 100%;

  overflow: auto;
  transition: all 1s;
  background-color: ${colors.WHITE};
`;

const Chevron = styled(Icon)`
  position: relative;
`;

const Container = styled.div`
  position: absolute;
  z-index: 99999999;
  display: flex;
  align-items: stretch;
  height: 90%;
  margin: 1em;
  transition: 0.5s;
  margin-left: ${(props: { open: boolean }) =>
    props.open ? "calc(-20% + 2em)" : "0.0em"};
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
  opacity: ${(props: { open: boolean }) => (props.open ? 0.4 : 1)};
  border: none;
  border-radius: 0% 25% 25% 0%;

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: none;
  }
`;

export const Sidebar = ({ children }: any) => {
  const [isOpen, setOpen] = useState(true);
  return (
    <Container open={isOpen}>
      <Column open={isOpen}>{children}</Column>
      <ExpandButton onClick={() => setOpen(!isOpen)} open={isOpen}>
        <Chevron icon={isOpen ? "chevron-right" : "chevron-left"} />
      </ExpandButton>
    </Container>
  );
};
