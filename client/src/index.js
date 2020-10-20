import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

// Load dotenv
import dotenv from "dotenv";
import { App } from "./App";
import { ManualSelectNewTab } from "./components/ManualSelectNewTab";

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

const isDocViewOnly = Boolean(document.getElementById("DOCIT-DOCVIEW-ONLY"));

isDocViewOnly // makeshift react-router. can't use react-router bc docview.html is opened as a completely different URL; react-router can only render in relative URLs
  ? ReactDOM.render(
      <ManualSelectNewTab />,
      document.getElementById("insertion-point")
    )
  : ReactDOM.render(<App />, document.getElementById("insertion-point"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// registerServiceWorker();
