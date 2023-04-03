/*global chrome*/
import React from "react";

import styled from "styled-components";

import { ThemeProvider } from "@material-ui/core/styles";
import Popper from "@material-ui/core/Popper";

import { SelectModal } from "./SelectModal";
import { ManualSelect } from "./ManualSelect";
import WrappedJssComponent from "./ShadowComponent";
import { getLibertyModalMutationsObserver } from "./inputsDictionary";
import {
  renderChiclets,
  RenderChicletsActionTypes,
} from "./ScoreChiclet/index";

import { DEFAULT } from "../common/themes";
import { LOCAL_MODE, MAIN_MODAL_WIDTH, DOCIT_TAG } from "../common/constants";
import { useStore } from "../contexts/ZustandStore";
import { useEffect } from "react";

const Container = styled.div`
  width: ${MAIN_MODAL_WIDTH}px;
`;

export interface DocImageDimensions {
  width: number;
  height: number;
}

interface RequestWithFillValue {
  fillValue: string;
}

const getInputsAndTextAreas = (): NodeListOf<Element> =>
  document.querySelectorAll(DOCIT_TAG);

const addClickListeners = (
  elements: NodeListOf<Element>,
  listener: EventListener
): void => {
  elements.forEach((el: Element) => {
    el.addEventListener("click", listener);
  });
};

const removeClickListeners = (
  elements: NodeListOf<Element>,
  listener: EventListener
): void => {
  elements.forEach((el) => el.removeEventListener("click", listener));
};

export const RenderModal = () => {
  const [
    docData,
    selectedFile,
    konvaModalOpen,
    eventTarget,
    setEventTarget,
    kvpTableAnchorEl,
    openDocInNewTab,
  ] = [
    useStore((state) => state.docData),
    useStore((state) => state.selectedFile),
    useStore((state) => state.konvaModalOpen),
    useStore((state) => state.eventTarget),
    useStore((state) => state.setEventTarget),
    useStore((state) => state.kvpTableAnchorEl),
    useStore((state) => state.openDocInNewTab),
  ];
  const areThereDocs = docData.length > 0;
  const kvpTableOpen = Boolean(kvpTableAnchorEl);
  const id = kvpTableOpen ? "kvp-table-popover" : undefined;

  // set eventTarget (local mode)
  useEffect(() => {
    // native (not react) event
    const handleInputClick = (event: Event) => {
      setEventTarget(event.target as HTMLInputElement | HTMLTextAreaElement);
    };
    const inputEls = getInputsAndTextAreas();
    addClickListeners(inputEls, handleInputClick);
    return () => {
      removeClickListeners(inputEls, handleInputClick);
    };
  });

  // set eventTarget (liberty modal)
  useEffect(() => {
    const handleInputClick = (event: Event) => {
      setEventTarget(event.target as HTMLInputElement | HTMLTextAreaElement);
    };
    // listen for change in liberty modals (even fires on first modal open)
    const observer = getLibertyModalMutationsObserver(() => {
      // assign listeners here
      addClickListeners(getInputsAndTextAreas(), handleInputClick);
    });
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => {
      removeClickListeners(getInputsAndTextAreas(), handleInputClick);
      observer.disconnect();
    };
  });

  // listen for ManualSelect submit in other tab
  useEffect(() => {
    if (!LOCAL_MODE) {
      const callback = function (request: RequestWithFillValue) {
        if (request.fillValue) {
          if (eventTarget) {
            eventTarget.value = request.fillValue;
            renderChiclets(RenderChicletsActionTypes.blank, eventTarget);
          } else {
            chrome.runtime.sendMessage({ error: "eventTarget is falsy" });
          }
        }
      };
      chrome.runtime.onMessage.addListener(callback);
      return () => chrome.runtime.onMessage.removeListener(callback);
    }
  }, [eventTarget]);

  return (
    <ThemeProvider theme={DEFAULT}>
      {areThereDocs && selectedFile && (
        <>
          {eventTarget && (
            <Popper
              id={id}
              open={kvpTableOpen}
              anchorEl={kvpTableAnchorEl}
              keepMounted
              placement={"bottom-end"}
              container={() => document.getElementById("insertion-point")}
              modifiers={{
                preventOverflow: {
                  enabled: false,
                  boundariesElement: "window",
                },
                flip: { enabled: true },
                hide: { enabled: false },
              }}
            >
              <Container>
                <WrappedJssComponent
                  wrapperClassName={"shadow-root-for-modals"}
                >
                  <SelectModal />
                </WrappedJssComponent>
              </Container>
            </Popper>
          )}

          {konvaModalOpen && !openDocInNewTab && <ManualSelect />}
        </>
      )}
    </ThemeProvider>
  );
};
