import React, { useState, createContext } from "react";

import $ from "jquery";

import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { ThemeProvider } from "@material-ui/core/styles";
import Draggable, { DraggableData } from "react-draggable";

import { useState as useSpecialHookState } from "@hookstate/core";

import { globalSelectedFileState } from "./DocViewer";
import { getKeyValuePairsByDoc } from "./KeyValuePairs";
import { SelectModal } from "./SelectModal";
import WrappedJssComponent from "./ShadowComponent";
import { DEFAULT } from "../common/themes";
import {
  MODAL_WIDTH,
  MODAL_OFFSET_X,
  MODAL_OFFSET_Y,
} from "../common/constants";
import { assignTargetString } from "./libertyInputsDictionary";
import { useEffect } from "react";

export const MainModalContext = createContext({} as any);

export const RenderModal = () => {
  const [eventObj, setEventObj] = useState(null) as any;
  const [targetString, setTargetString] = useState(undefined as any);
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";
  const [mainModalOpen, setMainModalOpen] = useState(false);
  const id = mainModalOpen ? "docit-main-modal" : undefined;
  const [manualSelectModalOpen, setManualSelectModalOpen] = useState(false);
  const [selectModalHeight, setSelectModalHeight] = useState(250); // est. lower bound for modal height
  const [draggableCoords, setDraggableCoords] = useState({
    x: 0,
    y: 0,
  });
  const [minY, setMinY] = useState(0);
  const [maxY, setMaxY] = useState(0);
  const [minX, setMinX] = useState(0);
  const [maxX, setMaxX] = useState(0);

  // handle input el click
  $(document).ready(() => {
    $("input").click(function (event) {
      setEventObj(event);
      setTargetString(assignTargetString($(this)));
      setMainModalOpen(true);
    });
  });

  // set min / max for draggable, after height is set
  useEffect(() => {
    setMinY(0 - MODAL_OFFSET_Y - selectModalHeight + 70);
    setMaxY(0 + (window.innerHeight - MODAL_OFFSET_Y) - 70);
    setMinX(0 - MODAL_OFFSET_X - MODAL_WIDTH + 70);
    setMaxX(0 + MODAL_WIDTH + MODAL_OFFSET_X - 70);
  }, [selectModalHeight]);

  // if the modal height changes, make sure modal isn't off page
  useEffect(() => getCoordinates(), [minY]);

  // set modal coords. if modal is dragged off page, then will reposition
  const getCoordinates = (e?: any, data?: DraggableData) => {
    let x, y;
    if (data) {
      // i.e. as callback for <Draggable> onStop
      [x, y] = [data.x, data.y];
    } else {
      // i.e. as callback for useEffect, when the modal height changes
      [x, y] = [draggableCoords.x, draggableCoords.y];
    }
    x = x < minX ? minX : x > maxX ? maxX : x;
    y = y < minY ? minY : y > maxY ? maxY : y;
    setDraggableCoords({ x, y });
  };

  return (
    <ThemeProvider theme={DEFAULT}>
      {areThereDocs && isDocSelected && (
        <Modal
          id={id}
          open={mainModalOpen}
          onClose={() => setMainModalOpen(false)}
          aria-labelledby="main-modal-title"
          aria-describedby="main-modal-description"
          BackdropComponent={Backdrop}
          BackdropProps={{
            invisible: true,
          }}
          disableEnforceFocus
          disableAutoFocus
          disableScrollLock
        >
          <Fade in={mainModalOpen}>
            <Draggable
              disabled={manualSelectModalOpen ? true : false}
              onStop={getCoordinates}
              position={{ x: draggableCoords.x, y: draggableCoords.y }}
            >
              <div>
                <WrappedJssComponent>
                  <MainModalContext.Provider
                    value={{
                      mainModalOpen,
                      setMainModalOpen,
                      manualSelectModalOpen,
                      setManualSelectModalOpen,
                      setSelectModalHeight,
                    }}
                  >
                    <>
                      {eventObj && (
                        <SelectModal
                          eventObj={eventObj}
                          targetString={targetString}
                        />
                      )}
                    </>
                  </MainModalContext.Provider>
                </WrappedJssComponent>
              </div>
            </Draggable>
          </Fade>
        </Modal>
      )}
    </ThemeProvider>
  );
};
