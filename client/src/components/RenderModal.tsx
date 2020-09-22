import React, { useState, createContext } from "react";

import $ from "jquery";
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
import { assignTargetString } from "./libertyInputsDictionary";
import { useStore } from "../contexts/ZustandStore";

const Container = styled.div`
  width: ${MAIN_MODAL_WIDTH}px;
`;

export const MainModalContext = createContext({} as any);

export const RenderModal = () => {
  const [eventTarget, setEventTarget] = useState(null) as any;
  const [targetString, setTargetString] = useState(undefined as any);
  const areThereDocs = useStore((state) => state.docData).length > 0;
  const isDocSelected = useStore((state) => state.selectedFile) !== "";
  const [kvpTableAnchorEl, setKvpTableAnchorEl] = useState(
    null as null | HTMLElement
  );
  const kvpTableOpen = Boolean(kvpTableAnchorEl);
  const id = kvpTableOpen ? "kvp-table-popover" : undefined;
  const konvaModalOpen = useStore((state) => state.konvaModalOpen);
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

  // handle chiclet click
  $(document).ready(() => {
    $("span[id^='docit-accuracy-score-mounter-']").click(function () {
      const mounterID = this.id.replace("docit-accuracy-score-mounter-", "");
      const eventTarget = $(`input.has-docit-mounter-${mounterID}`).get()[0];

      setEventTarget(eventTarget);
      setTargetString(assignTargetString(eventTarget));
      setKvpTableAnchorEl(eventTarget);
    });
  });

  return (
    <ThemeProvider theme={DEFAULT}>
      {areThereDocs && isDocSelected && eventTarget && (
        <>
          <Popper
            id={id}
            open={kvpTableOpen}
            anchorEl={kvpTableAnchorEl}
            keepMounted
            placement={"bottom-end"}
            container={() => document.getElementById("insertion-point")}
            modifiers={{
              preventOverflow: { enabled: false, boundariesElement: "window" },
              flip: { enabled: true },
              hide: { enabled: false },
            }}
          >
            <Container>
              <WrappedJssComponent wrapperClassName={"shadow-root-for-modals"}>
                <MainModalContext.Provider
                  value={{
                    kvpTableAnchorEl,
                    setKvpTableAnchorEl,
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
                  <SelectModal
                    eventTarget={eventTarget}
                    targetString={targetString}
                  />
                </MainModalContext.Provider>
              </WrappedJssComponent>
            </Container>
          </Popper>

          {konvaModalOpen && (
            <MainModalContext.Provider
              value={{
                kvpTableAnchorEl,
                setKvpTableAnchorEl,
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
              <ManualSelect eventTarget={eventTarget} />
            </MainModalContext.Provider>
          )}
        </>
      )}
    </ThemeProvider>
  );
};
