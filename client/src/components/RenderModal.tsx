import React, { useState, createContext } from "react";

import styled from "styled-components";

import { ThemeProvider } from "@material-ui/core/styles";
import Popper from "@material-ui/core/Popper";

import { SelectModal } from "./SelectModal";
import { ManualSelect } from "./ManualSelect";
import WrappedJssComponent from "./ShadowComponent";
import { getLibertyModalMutationsObserver } from "./libertyInputsDictionary";

import { DEFAULT } from "../common/themes";
import {
  MAIN_MODAL_WIDTH,
  KONVA_MODAL_OFFSET_X,
  KONVA_MODAL_OFFSET_Y,
  DOC_IMAGE_WIDTH,
  KONVA_MODAL_HEIGHT,
  DOCIT_TAG,
} from "../common/constants";
import { useStore } from "../contexts/ZustandStore";
import { useEffect } from "react";

const Container = styled.div`
  width: ${MAIN_MODAL_WIDTH}px;
`;

export interface DocImageDimensions {
  width: number;
  height: number;
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

export const MainModalContext = createContext({} as any);

export const RenderModal = () => {
  const [
    docData,
    selectedFile,
    konvaModalOpen,
    eventTarget,
    setEventTarget,
    kvpTableAnchorEl,
  ] = [
    useStore((state) => state.docData),
    useStore((state) => state.selectedFile),
    useStore((state) => state.konvaModalOpen),
    useStore((state) => state.eventTarget),
    useStore((state) => state.setEventTarget),
    useStore((state) => state.kvpTableAnchorEl),
  ];
  const areThereDocs = docData.length > 0;
  const kvpTableOpen = Boolean(kvpTableAnchorEl);
  const id = kvpTableOpen ? "kvp-table-popover" : undefined;
  const [konvaModalDraggCoords, setKonvaModalDraggCoords] = useState({
    x: KONVA_MODAL_OFFSET_X,
    y: KONVA_MODAL_OFFSET_Y,
  });
  const [konvaModalDimensions, setKonvaModalDimensions] = useState({
    width: DOC_IMAGE_WIDTH,
    height: KONVA_MODAL_HEIGHT,
  });
  const [docImageDimensions, setDocImageDimensions] = useState({
    width: 0,
    height: 0,
  } as DocImageDimensions);

  // handle input el click (local mode)
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

  // handle input el click (liberty modal)
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
                  <MainModalContext.Provider
                    value={{
                      konvaModalDraggCoords,
                      setKonvaModalDraggCoords,
                      konvaModalDimensions,
                      setKonvaModalDimensions,
                      docImageDimensions,
                      setDocImageDimensions,
                    }}
                  >
                    <SelectModal />
                  </MainModalContext.Provider>
                </WrappedJssComponent>
              </Container>
            </Popper>
          )}

          {konvaModalOpen && (
            <MainModalContext.Provider
              value={{
                konvaModalDraggCoords,
                setKonvaModalDraggCoords,
                konvaModalDimensions,
                setKonvaModalDimensions,
                docImageDimensions,
                setDocImageDimensions,
              }}
            >
              <ManualSelect />
            </MainModalContext.Provider>
          )}
        </>
      )}
    </ThemeProvider>
  );
};
