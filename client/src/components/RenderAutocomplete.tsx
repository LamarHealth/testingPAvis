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
  max-height: 280px;
  overflow-y: scroll;
  background-color: white;
  border: 1px solid ${colors.KVP_TABLE_BORDER};
`;

export const RenderAutocomplete = () => {
  const docData = useStore((state) => state.docData);
  const selectedFile = useStore((state) => state.selectedFile);
  const [filter, setFilter] = useState("" as string);
  const autocompleteAnchor = useStore((state) => state.autocompleteAnchor);
  const setAutocompleteAnchor = useStore(
    (state) => state.setAutocompleteAnchor
  );
  const open = Boolean(autocompleteAnchor);

  // doc data
  const selectedDocData = docData.filter(
    (doc) => doc.docID === selectedFile
  )[0];
  const isDocSelected = Boolean(selectedDocData);
  const allLinesAndValues = isDocSelected
    ? Object.entries(selectedDocData.keyValuePairs)
        .map((entry) => entry[1])
        .concat(selectedDocData.lines)
        .filter((value) => value !== "")
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())) // case insens. sorting
    : [];
  const areThereFilteredEntries = isDocSelected
    ? allLinesAndValues.filter((value: string) =>
        value.toLowerCase().includes(filter.toLowerCase())
      ).length > 0
    : false;

  // handle input typing
  $(document).ready(() => {
    $("input").on("input", function () {
      const inputEl = this as HTMLInputElement;
      setFilter(inputEl.value);
      setAutocompleteAnchor(inputEl);
    });
  });

  // listen for menu tabbing
  const findActiveElInShadowRoot = () => {
    const container = document.querySelector(
      "#container-for-autocomplete-dropdown"
    );
    const shadowRoot = container?.children[0].children[0].shadowRoot;
    const menuList = shadowRoot?.querySelector("ul") as HTMLElement;
    const activeElementInShadowRoot = shadowRoot?.activeElement;
    return { activeElementInShadowRoot, menuList };
  };

  useEffect(() => {
    function keydownListener(event: any) {
      const {
        activeElementInShadowRoot,
        menuList,
      } = findActiveElInShadowRoot();

      if (
        !autocompleteAnchor ||
        event.code !== "Tab" ||
        (activeElementInShadowRoot &&
          activeElementInShadowRoot.nodeName === "LI") // even tho we focus() on the menuList, which is <ul>, mui puts the focus on the first <li> in the list
      )
        return;
      else {
        // only want to focus on the menu with the first tab, subsequent tabs will iterate through the menu list
        menuList?.focus();
      }
    }
    document.addEventListener("keydown", keydownListener);
    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [autocompleteAnchor]);

  // handle click away
  const handleClose = (event: any) => {
    if (autocompleteAnchor && event.target === autocompleteAnchor) {
      return;
    } else {
      setAutocompleteAnchor(null);
    }
  };

  return (
    <>
      {isDocSelected && (
        <ThemeProvider theme={DEFAULT}>
          <Popper
            anchorEl={autocompleteAnchor}
            open={open}
            container={() => document.getElementById("insertion-point")}
            placement={"bottom-start"}
          >
            <Container id={"container-for-autocomplete-dropdown"}>
              <WrappedJssComponent wrapperClassName={"shadow-root-for-modals"}>
                <ClickAwayListener onClickAway={handleClose}>
                  {areThereFilteredEntries ? (
                    <MenuList
                      tabIndex={0}
                      style={
                        autocompleteAnchor
                          ? {
                              width: window.getComputedStyle(autocompleteAnchor)
                                .width,
                            }
                          : {}
                      }
                    >
                      {allLinesAndValues
                        .filter((value: string) =>
                          value.toLowerCase().includes(filter.toLowerCase())
                        )
                        .map((value, i) => {
                          const handleClick = () => {
                            if (autocompleteAnchor) {
                              autocompleteAnchor.value = value;
                              setAutocompleteAnchor(null);
                            }
                          };

                          return (
                            <MenuItem
                              key={i}
                              tabIndex={0}
                              onClick={handleClick}
                              style={{ whiteSpace: "normal" }} // for text wrapping
                            >
                              {value}
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
