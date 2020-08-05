import React, { useState, createContext } from "react";

import $ from "jquery";

import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { ThemeProvider } from "@material-ui/core/styles";

import { useState as useSpecialHookState } from "@hookstate/core";

import { globalSelectedFileState } from "./DocViewer";
import { getKeyValuePairsByDoc } from "./KeyValuePairs";
import { SelectModal } from "./SelectModal";
import WrappedJssComponent from "./ShadowComponent";
import { DEFAULT } from "../common/themes";

export const ModalContext = createContext({} as any);

export const RenderModal = () => {
  const [eventObj, setEventObj] = useState(null) as any;
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";
  const [mainModalOpen, setMainModalOpen] = useState(false);
  const id = mainModalOpen ? "docit-main-modal" : undefined;

  $(document).ready(() => {
    $("input[type='text']").click((event) => {
      setEventObj(event);
      setMainModalOpen(true);
    });
  });

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
            <WrappedJssComponent>
              <ModalContext.Provider
                value={{ mainModalOpen, setMainModalOpen }}
              >
                <>{eventObj && <SelectModal eventObj={eventObj} />}</>
              </ModalContext.Provider>
            </WrappedJssComponent>
          </Fade>
        </Modal>
      )}
    </ThemeProvider>
  );
};
