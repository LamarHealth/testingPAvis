import React, { useState, createContext } from "react";

import $ from "jquery";
import styled from "styled-components";

import { ThemeProvider } from "@material-ui/core/styles";
import Draggable, { DraggableData } from "react-draggable";

import { useState as useSpecialHookState } from "@hookstate/core";

import { globalSelectedFileState } from "./DocViewer";
import { getKeyValuePairsByDoc } from "./KeyValuePairs";
import { SelectModal } from "./SelectModal";
import { KonvaModal } from "./KonvaModal";
import { ManualSelect } from "./ManualSelect";
import WrappedJssComponent from "./ShadowComponent";
import { DEFAULT } from "../common/themes";
import {
  MAIN_MODAL_OFFSET_Y,
  MAIN_MODAL_LEFT_BOUND,
  MAIN_MODAL_BOTTOM_BOUND,
  MAIN_MODAL_RIGHT_BOUND,
  KONVA_MODAL_OFFSET_X,
  KONVA_MODAL_OFFSET_Y,
  DOC_IMAGE_WIDTH,
  KONVA_MODAL_HEIGHT,
} from "../common/constants";
import { assignTargetString } from "./libertyInputsDictionary";
import { useEffect } from "react";

const Container = styled.div`
  // need pos relative or else z-index will not work
  position: relative;
  z-index: 999;
`;

export const MainModalContext = createContext({} as any);

export const RenderModal = () => {
  const [eventObj, setEventObj] = useState(null) as any;
  const [targetString, setTargetString] = useState(undefined as any);
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";
  const [mainModalOpen, setMainModalOpen] = useState(false);
  const id = mainModalOpen ? "docit-main-modal" : undefined;
  const [mainModalHeight, setMainModalHeight] = useState(250); // est. lower bound for select modal height
  const [mainModalDraggCoords, setMainModalDraggCoords] = useState({
    x: 0,
    y: 0,
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

  // handle input el click
  $(document).ready(() => {
    $("input").click(function (event) {
      setEventObj(event);
      setTargetString(assignTargetString($(this)));
      setMainModalOpen(true);
    });
  });

  // handle modal height change if it results in pushing modal off screen
  const handleModalHeightChange = () => {
    let y = mainModalDraggCoords.y;
    const minY = -MAIN_MODAL_OFFSET_Y - mainModalHeight + 70;
    y = y < minY ? minY : y;
    setMainModalDraggCoords((prev) => {
      return { ...prev, y };
    });
  };
  useEffect(() => {
    handleModalHeightChange();
  }, [mainModalHeight]);

  // set modal coords
  const handleDragStop = (e: any, data: DraggableData) => {
    let [x, y] = [data.x, data.y];
    setMainModalDraggCoords({ x, y });
  };

  return (
    <ThemeProvider theme={DEFAULT}>
      {areThereDocs && isDocSelected && (
        <WrappedJssComponent>
          <MainModalContext.Provider
            value={{
              mainModalOpen,
              setMainModalOpen,
              setMainModalHeight,
              konvaModalOpen,
              setKonvaModalOpen,
              konvaModalDraggCoords,
              setKonvaModalDraggCoords,
              konvaModalDimensions,
              setKonvaModalDimensions,
              docImageDimensions,
              setDocImageDimensions,
            }}
          >
            {mainModalOpen && (
              <Container>
                <Draggable
                  disabled={konvaModalOpen ? true : false}
                  onStop={handleDragStop}
                  position={{
                    x: mainModalDraggCoords.x,
                    y: mainModalDraggCoords.y,
                  }}
                  bounds={{
                    left: MAIN_MODAL_LEFT_BOUND,
                    top: -MAIN_MODAL_OFFSET_Y - mainModalHeight + 70,
                    right: MAIN_MODAL_RIGHT_BOUND,
                    bottom: MAIN_MODAL_BOTTOM_BOUND,
                  }}
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
                </Draggable>
              </Container>
            )}
            {konvaModalOpen && eventObj && <ManualSelect eventObj={eventObj} />}
          </MainModalContext.Provider>
        </WrappedJssComponent>
      )}
    </ThemeProvider>
  );
};
