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
import { getLibertyModalMutationsObserver } from "./libertyInputsDictionary";

const Container = styled.div`
  max-height: 280px;
  overflow-y: scroll;
  background-color: white;
  border: 1px solid ${colors.KVP_TABLE_BORDER};
`;

const findActiveElInShadowRoot = () => {
  const container = document.querySelector(
    "#container-for-autocomplete-dropdown"
  );
  const shadowRoot = container?.children[0].children[0].shadowRoot;
  const menuList = shadowRoot?.querySelector("ul") as HTMLElement;
  const activeElementInShadowRoot = shadowRoot?.activeElement as HTMLElement;
  return { activeElementInShadowRoot, menuList };
};

const handleMenuNavigation = (event: any) => {
  // cannot type as a react KeyboardEvent because it doesn't have stopImmediatePropagation
  const { activeElementInShadowRoot, menuList } = findActiveElInShadowRoot();

  if (
    event.code === "ArrowDown" ||
    event.code === "ArrowUp" ||
    event.code === "Tab"
  ) {
    if (!activeElementInShadowRoot) {
      // if not in the menu yet, then focus on the menu
      menuList?.focus();
    } else {
      if (event.code === "ArrowDown" || event.code === "ArrowUp") {
        // cancel the arrow key press, because is doing some mui jankiness
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        if (
          // if focused on whole menu, focus on the first LI
          activeElementInShadowRoot &&
          activeElementInShadowRoot.nodeName === "UL"
        ) {
          const firstLi = menuList.children[0] as HTMLElement;
          firstLi.focus();
        } else if (
          // else go up or down the LIs
          activeElementInShadowRoot &&
          activeElementInShadowRoot.nodeName === "LI"
        ) {
          if (event.code === "ArrowDown") {
            const nextEl = activeElementInShadowRoot.nextSibling as HTMLElement;
            nextEl && nextEl.focus();
          } else if (event.code === "ArrowUp") {
            const prevEl = activeElementInShadowRoot.previousSibling as HTMLElement;
            prevEl && prevEl.focus();
          }
        }
      }
    }
  }
};

export const RenderAutocomplete = () => {
  const [docData, selectedFile, autocompleteAnchor, setAutocompleteAnchor] = [
    useStore((state) => state.docData),
    useStore((state) => state.selectedFile),
    useStore((state) => state.autocompleteAnchor),
    useStore((state) => state.setAutocompleteAnchor),
  ];
  const [filter, setFilter] = useState("" as string);
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
  const listenForInputTypying = () => {
    $(document).ready(() => {
      $("input").on("input", function () {
        const inputEl = this as HTMLInputElement;
        setFilter(inputEl.value);
        setAutocompleteAnchor(inputEl);
      });
    });
  };
  useEffect(listenForInputTypying, []); // add listener on first render only; subsequent adds, see below

  // listen for liberty modal open (specific for liberty site)
  useEffect(() => {
    const observer = getLibertyModalMutationsObserver(listenForInputTypying);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  });

  // listen for menu tabbing / arrow keys
  useEffect(() => {
    function arrowKeyListener(event: any) {
      if (autocompleteAnchor) {
        handleMenuNavigation(event);
      }
    }
    document.addEventListener("keydown", arrowKeyListener, true);
    return () => {
      document.removeEventListener("keydown", arrowKeyListener, true);
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
