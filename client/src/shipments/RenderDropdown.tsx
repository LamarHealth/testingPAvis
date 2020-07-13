import React from "react";
import ReactDOM from "react-dom";

import $ from "jquery";
import { createPopper } from "@popperjs/core";

import { Dropdown } from "./Dropdown";

export const RenderDropdown = () => {
  $(document).ready(() => {
    $("input").click((event) => {
      // create a mounter and render Dropdown
      const mounter = $(`<div id="mounter"></div>`).insertAfter(event.target);

      ReactDOM.render(
        <Dropdown eventObj={event}></Dropdown>,
        document.querySelector(`#mounter`)
      );

      // turn dropdownElement table into instance of Popper.js
      const dropdownElement = document.querySelector(
        `#dropdown`
      ) as HTMLElement;

      let popperInstance = createPopper(event.target, dropdownElement, {
        placement: "bottom-start",
      });

      // remove on mouseleave
      $(event.target).mouseleave(() => {
        // don't remove if hovering over the dropdownElement
        if ($(`#dropdown:hover`).length > 0) {
          $(dropdownElement).mouseleave(() => {
            dropdownElement.remove();
            mounter.remove();
            popperInstance.destroy();
          });
        } else {
          dropdownElement.remove();
          mounter.remove();
          popperInstance.destroy();
        }
      });
    });
  });
  return (
    <p style={{ display: "none" }}>
      need to return something in order to run the jquery above
    </p>
  );
};
