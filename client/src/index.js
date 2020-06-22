import React from "react";
import ReactDOM from "react-dom";
import { StyleSheetManager } from "styled-components";
import Frame, { FrameContextConsumer } from "react-frame-component";
import $ from "jquery";
import "./index.css";
import DocViewer from "./shipments/DocViewer";
// import App from "./App";
// blueprintjs
import "@blueprintjs/core/lib/css/blueprint.css";

// Load dotenv
import dotenv from "dotenv";
dotenv.config();

// $(
//   '<div id="insertion-point" style="width:100%;height:100%;z-index:99999;position:fixed;" />'
//   //   '<iframe id="insertion-point" allowtransparency="true" style=" overflow: hidden; position: fixed; right: 0px; top: 0px; left: auto; float: none; z-index: 2147483647; background: transparent;"/>'
// ).insertBefore(document.body);
const initialContent = `<!DOCTYPE html><html><head>${document.head.innerHTML}</head><body><div></div></body></html>`;

ReactDOM.render(
  <Frame initialContent={initialContent}>
    <FrameContextConsumer>
      {(frameContext) => (
        <StyleSheetManager target={frameContext.document.head}>
          <React.Fragment>
            <DocViewer />
          </React.Fragment>
        </StyleSheetManager>
      )}
    </FrameContextConsumer>
  </Frame>,
  document.body
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// registerServiceWorker();
