import React, { useState, createContext } from "react";

import $ from "jquery";
//@ts-ignore
import root from "react-shadow/material-ui";

import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";

import { useState as useSpecialHookState } from "@hookstate/core";

import { globalSelectedFileState } from "./DocViewer";
import { getKeyValuePairsByDoc } from "./keyValuePairs";
import { ModalComponent } from "./Modal";

export const ModalContext = createContext({} as any);

export const RenderModal = () => {
  const [eventObj, setEventObj] = useState(null) as any;
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";
  const [mainModalOpen, setMainModalOpen] = useState(false);
  const id = mainModalOpen ? "docit-main-modal" : undefined;

  $(document).ready(() => {
    $("input").click((event) => {
      setEventObj(event);
      setMainModalOpen(true);
    });
  });

  return (
    <>
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
            <root.div>
              <ModalContext.Provider
                value={{ mainModalOpen, setMainModalOpen }}
              >
                <>{eventObj && <ModalComponent eventObj={eventObj} />}</>
              </ModalContext.Provider>
            </root.div>
          </Fade>
        </Modal>
      )}
    </>
  );
};
