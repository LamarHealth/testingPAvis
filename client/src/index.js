import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

// Load dotenv
import dotenv from "dotenv";
import ShipmentsDashboard from "./components/ShipmentsDashboard";
import { Sidebar } from "./components/Sidebar";
import { RenderModal } from "./components/RenderModal";
import { RenderAutocomplete } from "./components/RenderAutocomplete";

import { LOCAL_MODE, Z_INDEX_ALLOCATOR } from "./common/constants";
dotenv.config();

// set the document body to 0 z-index in build, so that our sidebar and modal outrank them
if (!LOCAL_MODE) {
  document.body.style.zIndex = Z_INDEX_ALLOCATOR.baseIndex;
  document.body.style.position = "relative";
}

const insertionPoint = document.createElement("div");
insertionPoint.id = "insertion-point";
insertionPoint.style.position = "relative";
insertionPoint.style.zIndex = Z_INDEX_ALLOCATOR.insertionPoint();

$(insertionPoint).insertBefore(document.body);

ReactDOM.render(
  <>
    <RenderModal />
    <RenderAutocomplete />
    <Sidebar />
    {LOCAL_MODE && (
      <body
        style={{
          position: "relative",
          zIndex: Z_INDEX_ALLOCATOR.body(),
        }}
      >
        <ShipmentsDashboard />
      </body>
    )}
  </>,
  document.getElementById("insertion-point")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// registerServiceWorker();
