import React, { useState, useEffect } from "react";

import $ from "jquery";
import styled from "styled-components";

import { useStore } from "../contexts/ZustandStore";

import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { ThemeProvider } from "@material-ui/core/styles";

import { DEFAULT } from "../common/themes";
import { colors } from "../common/colors";
import WrappedJssComponent from "./ShadowComponent";

const Container = styled.div`
  max-height: 400px;
  overflow-y: scroll;
  background-color: white;
  border: 1px solid ${colors.KVP_TABLE_BORDER};
`;

export const RenderAutocomplete = () => {
  const docData = useStore((state) => state.docData);
  const selectedFile = useStore((state) => state.selectedFile);
  const [filter, setFilter] = useState("" as string);
  const [anchor, setAnchor] = useState(null as null | HTMLInputElement);
  const open = Boolean(anchor);

  // doc data
  const selectedDocData = docData.filter(
    (doc) => doc.docID === selectedFile
  )[0];
  const isDocSelected = Boolean(selectedDocData);
  const areThereFilteredEntries = selectedDocData
    ? Boolean(
        Object.entries(selectedDocData.keyValuePairs)
          .filter((entry) => entry[1] !== "")
          .filter((entry) =>
            entry[1].toLowerCase().includes(filter.toLowerCase())
          ).length > 0
      )
    : false; // if selectedDocData is undef, is just false, else would be an issue below

  // handle input typing
  $(document).ready(() => {
    $("input").on("input", function () {
      const inputEl = this as HTMLInputElement;
      setFilter(inputEl.value);
      setAnchor(inputEl);
    });
  });

  // listen for menu tabbing
  useEffect(() => {
    function keydownListener(event: any) {
      const container = document.querySelector(
        "#container-for-autocomplete-dropdown"
      );
      const shadowRoot = container?.children[0].children[0].shadowRoot;
      const menuList = shadowRoot?.querySelector("ul") as HTMLElement;
      const activeElementInShadowRoot = shadowRoot?.activeElement;

      if (
        !anchor ||
        event.code !== "Tab" ||
        (activeElementInShadowRoot &&
          activeElementInShadowRoot.nodeName === "LI") // even tho we focus() on the menuList, which is <ul>, mui puts the focus on the first <li> in the list
      )
        return;
      else {
        // only want to focus on the menu the first tab, subsequent tabs will iterate through the menu list
        menuList?.focus();
      }
    }
    document.addEventListener("keydown", keydownListener);
    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [anchor]);

  // handle click away
  const handleClose = (event: any) => {
    if (anchor && event.target === anchor) {
      return;
    } else {
      setAnchor(null);
    }
  };

  return (
    <>
      {isDocSelected && (
        <ThemeProvider theme={DEFAULT}>
          <Popper
            anchorEl={anchor}
            open={open}
            container={() => document.getElementById("insertion-point")}
            placement={"bottom-start"}
          >
            <Container id={"container-for-autocomplete-dropdown"}>
              <WrappedJssComponent wrapperClassName={"shadow-root-for-modals"}>
                <ClickAwayListener onClickAway={handleClose}>
                  {areThereFilteredEntries ? (
                    <MenuList tabIndex={0}>
                      {Object.entries(selectedDocData.keyValuePairs)
                        .filter((entry) => entry[1] !== "")
                        .filter((entry) =>
                          entry[1].toLowerCase().includes(filter.toLowerCase())
                        )
                        .map((entry, i) => {
                          const handleClick = () => {
                            if (anchor) {
                              anchor.value = entry[1];
                              setAnchor(null);
                            }
                          };

                          return (
                            <MenuItem
                              key={i}
                              tabIndex={0}
                              onClick={handleClick}
                            >
                              {entry[1]}
                            </MenuItem>
                          );
                        })}
                    </MenuList>
                  ) : (
                    <MenuList>
                      <MenuItem>
                        <i>No items match your search</i>
                      </MenuItem>
                    </MenuList>
                  )}
                </ClickAwayListener>
              </WrappedJssComponent>
            </Container>
          </Popper>
        </ThemeProvider>
      )}
    </>
  );
};
