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
      ? `1px solid ${colors.LAYOUT_BLUE_SOLID}`
      : `1px solid ${colors.LAYOUT_BLUE_CLEAR}`};
  border-radius: 10px;
  display: flex;
  height: 100%;
  transition: all 1s;
  width: ${(props: { open: boolean }) => (props.open ? "100%" : "0%")};

  background-color: ${colors.WHITE};
`;

const Chevron = styled(Icon)`
  position: relative;
`;

const Container = styled.div`
  position: fixed;
  z-index: 99999999;
  display: flex;
  align-items: stretch;
  height: 90%;
  transition: 1s;
  width: ${(props: { open: boolean }) => (props.open ? "25%" : "0%")};
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

export const Sidebar = ({ children }: any) => {
  const [isOpen, setOpen] = useState(false);
  return (
    <Container open={isOpen}>
      <Column open={isOpen}>{children}</Column>
      <ExpandButton onClick={() => setOpen(!isOpen)} open={isOpen}>
        <Chevron icon={isOpen ? "chevron-left" : "chevron-right"} />
      </ExpandButton>
    </Container>
  );
};
