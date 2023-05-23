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
import {
  useStore,
  State,
  useSelectedDocumentStore,
  SelectedDocumentStoreState,
} from "../contexts/ZustandStore";

import { useEffect } from "react";

const Container = styled.div`
  width: ${MAIN_MODAL_WIDTH}px;
`;

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
    konvaModalOpen,
    eventTarget,
    setEventTarget,
    kvpTableAnchorEl,
    openDocInNewTab,
  ] = [
    useStore((state: State) => state.konvaModalOpen),
    useStore((state: State) => state.eventTarget),
    useStore((state: State) => state.setEventTarget),
    useStore((state: State) => state.kvpTableAnchorEl),
    useStore((state: State) => state.openDocInNewTab),
  ];

  const [selectedDocument] = [
    useSelectedDocumentStore(
      (state: SelectedDocumentStoreState) => state.selectedDocument
    ),
  ];

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

  // TODO: Remove this
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

  // TODO: Remove this
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
    <>
      {!!selectedDocument && (
        <ThemeProvider theme={DEFAULT}>
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
                  <SelectModal document={selectedDocument} />
                </WrappedJssComponent>
              </Container>
            </Popper>
          )}

          {konvaModalOpen && !openDocInNewTab && <ManualSelect />}
        </ThemeProvider>
      )}
    </>
  );
};
