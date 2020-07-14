import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";

import $ from "jquery";
//@ts-ignore
import root from "react-shadow/material-ui";

import Popover from "@material-ui/core/Popover";

import { colors } from "./../common/colors";
import { constants } from "./../common/constants";
import { Dropdown } from "./Dropdown";
import { rootCertificates } from "tls";

export const RenderDropdown = () => {
  const [eventObj, setEventObj] = useState(null) as any;
  const [anchorEl, setAnchorEl] = useState(null) as any;

  // popover
  const popoverOpen = Boolean(anchorEl);
  const id = popoverOpen ? "docit-modal" : undefined;

  const popoverHandleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const renderBackdrop = () => {
    // unfortunately not achievable via mui API or styled-components
    const popoverRoot = document.querySelector("#docit-modal");
    const backdrop: any = popoverRoot?.children[0];
    backdrop.style.backgroundColor = colors.MANUAL_SELECT_POPOVER_BACKDROP;
  };

  const popoverHandleClose = () => {
    setAnchorEl(null);
  };

  $(document).ready(() => {
    $("input").click((event) => {
      setEventObj(event);
      popoverHandleClick(event);
    });
  });

  return (
    <Popover
      id={id}
      open={popoverOpen}
      anchorEl={anchorEl}
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
        <div>{eventObj && <Dropdown eventObj={eventObj} />}</div>
      </root.div>
    </Popover>
  );
};
