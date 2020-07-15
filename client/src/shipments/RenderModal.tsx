import React, { useState, createContext } from "react";

import $ from "jquery";
//@ts-ignore
import root from "react-shadow/material-ui";

import { useState as useSpecialHookState } from "@hookstate/core";

import { globalSelectedFileState } from "./DocViewer";
import { getKeyValuePairsByDoc } from "./keyValuePairs";
import { ModalComponent } from "./Modal";

// NEW
import Modal from "@material-ui/core/Modal";

export const DropdownContext = createContext({} as any);

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
          aria-describedby="main-modal-descripton"
        >
          <root.div>
            <DropdownContext.Provider value={{ setMainModalOpen }}>
              <>{eventObj && <ModalComponent eventObj={eventObj} />}</>
            </DropdownContext.Provider>
          </root.div>
        </Modal>
      )}
    </>
  );
};
