import React from "react";
import ReactDOM from "react-dom";
import Frame from "react-frame-component";
import $ from "jquery";
import "./index.css";
import DocViewer from "./shipments/DocViewer";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
// blueprintjs
import "@blueprintjs/core/lib/css/blueprint.css";

// Load dotenv
import dotenv from "dotenv";
dotenv.config();

// $(
//   '<div id="insertion-point" style="width:100%;height:100%;z-index:99999;position:fixed;" />'
//   //   '<iframe id="insertion-point" allowtransparency="true" style=" overflow: hidden; position: fixed; right: 0px; top: 0px; left: auto; float: none; z-index: 2147483647; background: transparent;"/>'
// ).insertBefore(document.body);

ReactDOM.render(
  <Frame>
    <DocViewer />
  </Frame>,
  document.body
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// registerServiceWorker();
