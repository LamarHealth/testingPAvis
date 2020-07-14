import React, { useState, createContext } from "react";

import $ from "jquery";
//@ts-ignore
import root from "react-shadow/material-ui";

import Popover from "@material-ui/core/Popover";
import { useState as useSpecialHookState } from "@hookstate/core";

import { colors } from "../common/colors";
import { constants } from "../common/constants";
import { Modal } from "./Modal";
import { globalSelectedFileState } from "./DocViewer";
import { getKeyValuePairsByDoc } from "./KeyValuePairs";

export const DropdownContext = createContext({} as any);

export const RenderModal = () => {
  const [eventObj, setEventObj] = useState(null) as any;
  const [modalAnchorEl, setModalAnchorEl] = useState(null) as any;
  const areThereDocs = getKeyValuePairsByDoc().length > 0;
  const isDocSelected =
    useSpecialHookState(globalSelectedFileState).get() !== "";

  // popover
  const popoverOpen = Boolean(modalAnchorEl);
  const id = popoverOpen ? "docit-modal" : undefined;

  const popoverHandleClick = (event: any) => {
    setModalAnchorEl(event.currentTarget);
  };

  const renderBackdrop = () => {
    // unfortunately not achievable via mui API or styled-components
    const popoverRoot = document.querySelector("#docit-modal");
    const backdrop: any = popoverRoot?.children[0];
    backdrop.style.backgroundColor = colors.MANUAL_SELECT_POPOVER_BACKDROP;
  };

  const popoverHandleClose = () => {
    setModalAnchorEl(null);
  };

  $(document).ready(() => {
    $("input").click((event) => {
      setEventObj(event);
      popoverHandleClick(event);
    });
  });

  return (
    <>
      {areThereDocs ? (
        isDocSelected ? (
          <div style={{ width: `${constants.MODAL_WIDTH}px` }}>
            <Popover
              id={id}
              open={popoverOpen}
              anchorEl={modalAnchorEl}
              onEnter={renderBackdrop}
              onClose={popoverHandleClose}
              anchorReference="anchorPosition"
              anchorPosition={{
                top: 150,
                left: (window.innerWidth - constants.MODAL_WIDTH) / 2,
              }}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "center",
                horizontal: "center",
              }}
            >
              <root.div>
                <DropdownContext.Provider value={{ setModalAnchorEl }}>
                  <div>{eventObj && <Modal eventObj={eventObj} />}</div>
                </DropdownContext.Provider>
              </root.div>
            </Popover>
          </div>
        ) : (
          <p style={{ display: "none" }}>**null**</p>
        )
      ) : (
        <p style={{ display: "none" }}>**null**</p>
      )}
    </>
  );
};
