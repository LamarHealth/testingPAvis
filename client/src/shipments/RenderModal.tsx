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
import { assignTargetString } from "./libertyInputsDictionary";

export const MainModalContext = createContext({} as any);

export const RenderModal = () => {
  const [eventObj, setEventObj] = useState(null) as any;
  const [targetString, setTargetString] = useState(undefined as any);
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";
  const [mainModalOpen, setMainModalOpen] = useState(false);
  const [manualSelectModalOpen, setManualSelectModalOpen] = useState(false);
  const [draggableCoords, setDraggableCoords] = useState({ x: 0, y: 0 });
  const id = mainModalOpen ? "docit-main-modal" : undefined;

  $(document).ready(() => {
    $("input").click(function (event) {
      setEventObj(event);
      setTargetString(assignTargetString($(this)));
      setMainModalOpen(true);
    });
  });

  const getCoordinates = (e: any, data: any) =>
    setDraggableCoords({ x: data.x, y: data.y });

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
            timeout: 500,
          }}
        >
          <Fade in={mainModalOpen}>
            <Draggable
              disabled={manualSelectModalOpen ? true : false}
              onStop={getCoordinates}
              defaultPosition={{ x: draggableCoords.x, y: draggableCoords.y }}
            >
              <div>
                <WrappedJssComponent>
                  <MainModalContext.Provider
                    value={{
                      mainModalOpen,
                      setMainModalOpen,
                      manualSelectModalOpen,
                      setManualSelectModalOpen,
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
