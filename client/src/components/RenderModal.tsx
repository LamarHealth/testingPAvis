import React, { useState, createContext } from "react";

import $ from "jquery";
import styled from "styled-components";

import { ThemeProvider } from "@material-ui/core/styles";
import { Rnd, DraggableData } from "react-rnd";

import { useState as useSpecialHookState } from "@hookstate/core";

import { globalSelectedFileState } from "../contexts/SelectedFile";
import { getKeyValuePairsByDoc } from "./KeyValuePairs";
import { SelectModal } from "./SelectModal";
import { ManualSelect } from "./ManualSelect";
import WrappedJssComponent from "./ShadowComponent";
import { DEFAULT } from "../common/themes";
import {
  MAIN_MODAL_OFFSET_X,
  MAIN_MODAL_OFFSET_Y,
  KONVA_MODAL_OFFSET_X,
  KONVA_MODAL_OFFSET_Y,
  DOC_IMAGE_WIDTH,
  KONVA_MODAL_HEIGHT,
} from "../common/constants";
import { assignTargetString } from "./libertyInputsDictionary";

// need pos relative or else z-index will not work
const Container = styled.div`
  position: relative;
  z-index: 9999;
`;

export const MainModalContext = createContext({} as any);

export const RenderModal = () => {
  const [eventObj, setEventObj] = useState(null) as any;
  const [targetString, setTargetString] = useState(undefined as any);
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";
  const [mainModalOpen, setMainModalOpen] = useState(false);
  const [mainModalDraggCoords, setMainModalDraggCoords] = useState({
    x: MAIN_MODAL_OFFSET_X,
    y: MAIN_MODAL_OFFSET_Y,
  });
  const [konvaModalOpen, setKonvaModalOpen] = useState(false);
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
  $(document).ready(() => {
    $("input").click(function (event) {
      setEventObj(event);
      setTargetString(assignTargetString($(this)));
      setMainModalOpen(true);
    });
  });

  // set main modal coords
  const handleDragStop = (e: any, data: DraggableData) => {
    let [x, y] = [data.x, data.y];
    setMainModalDraggCoords({ x, y });
  };

  return (
    <ThemeProvider theme={DEFAULT}>
      {areThereDocs && isDocSelected && (
        <WrappedJssComponent wrapperClassName={"shadow-root-for-modals"}>
          <MainModalContext.Provider
            value={{
              mainModalOpen,
              setMainModalOpen,
              konvaModalOpen,
              setKonvaModalOpen,
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
            {mainModalOpen && (
              <Container>
                <Rnd
                  enableResizing={false}
                  position={mainModalDraggCoords}
                  onDragStop={handleDragStop}
                  bounds="window"
                >
                  <div>
                    <>
                      {eventObj && (
                        <SelectModal
                          eventObj={eventObj}
                          targetString={targetString}
                        />
                      )}
                    </>
                  </div>
                </Rnd>
              </Container>
            )}
            {konvaModalOpen && eventObj && <ManualSelect eventObj={eventObj} />}
          </MainModalContext.Provider>
        </WrappedJssComponent>
      )}
    </ThemeProvider>
  );
};
