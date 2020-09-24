import React, { useState, createContext } from "react";

import styled from "styled-components";

import { ThemeProvider } from "@material-ui/core/styles";
import Popper from "@material-ui/core/Popper";

import { SelectModal } from "./SelectModal";
import { ManualSelect } from "./ManualSelect";
import WrappedJssComponent from "./ShadowComponent";
import { DEFAULT } from "../common/themes";
import {
  MAIN_MODAL_WIDTH,
  KONVA_MODAL_OFFSET_X,
  KONVA_MODAL_OFFSET_Y,
  DOC_IMAGE_WIDTH,
  KONVA_MODAL_HEIGHT,
} from "../common/constants";
import { useStore } from "../contexts/ZustandStore";
import { useEffect } from "react";

const Container = styled.div`
  width: ${MAIN_MODAL_WIDTH}px;
`;

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
  const isDocSelected = selectedFile !== "";
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
  });
  const [errorFetchingImage, setErrorFetchingImage] = useState(false);
  const [errorFetchingGeometry, setErrorFetchingGeometry] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "unable to fetch resources from server. Try again later."
  );
  const [errorCode, setErrorCode] = useState(400);

  // handle input el click
  useEffect(() => {
    const handleInputClick = (event: any) => {
      setEventTarget(event.target);
    };
    const inputEls = document.querySelectorAll("input");
    inputEls.forEach((inputEl) =>
      inputEl.addEventListener("click", handleInputClick)
    );
    return () => {
      inputEls.forEach((inputEl) =>
        inputEl.removeEventListener("click", handleInputClick)
      );
    };
  });

  return (
    <ThemeProvider theme={DEFAULT}>
      {areThereDocs && isDocSelected && (
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
                      errorFetchingImage,
                      setErrorFetchingImage,
                      errorFetchingGeometry,
                      setErrorFetchingGeometry,
                      errorMessage,
                      setErrorMessage,
                      errorCode,
                      setErrorCode,
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
                errorFetchingImage,
                setErrorFetchingImage,
                errorFetchingGeometry,
                setErrorFetchingGeometry,
                errorMessage,
                setErrorMessage,
                errorCode,
                setErrorCode,
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
