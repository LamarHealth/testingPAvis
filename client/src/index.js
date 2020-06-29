import React from "react";
import ReactDOM from "react-dom";
import styled, { StyleSheetManager } from "styled-components";
import Frame, { FrameContextConsumer } from "react-frame-component";
import $ from "jquery";
import "@blueprintjs/core/lib/css/blueprint.css";

// Load dotenv
import dotenv from "dotenv";
import ShipmentsDashboard from "./shipments/ShipmentsDashboard";
import DocViewer from "./shipments/DocViewer";
import { Sidebar } from "./shipments/Sidebar";
dotenv.config();

// $(
//   '<div id="insertion-point" style="width:100%;height:100%;z-index:99999;position:fixed;" />'
//   //   '<iframe id="insertion-point" allowtransparency="true" style=" overflow: hidden; position: fixed; right: 0px; top: 0px; left: auto; float: none; z-index: 2147483647; background: transparent;"/>'
// ).insertBefore(document.body);
const initialContent = `<!DOCTYPE html><html><head>${document.head.innerHTML}</head><body><div></div></body></html>`;
const SideBarFrame = styled(Frame)`
  border: none;
  display: block;
  overflow: hidden;
  left: auto;
  float: none;
  height: 100vh;
  width: auto;
  background: transparent;
`;

$('<div id="insertion-point"/>').insertBefore(document.body);

ReactDOM.render(
  <div>
    <Sidebar>
      <SideBarFrame initialContent={initialContent}>
        <FrameContextConsumer>
          {(frameContext) => (
            <StyleSheetManager target={frameContext.document.head}>
              <React.Fragment>
                <DocViewer />
              </React.Fragment>
            </StyleSheetManager>
          )}
        </FrameContextConsumer>
      </SideBarFrame>
    </Sidebar>
    {process.env.MODE || (
      <body>
        <ShipmentsDashboard />
      </body>
    )}
  </div>,
  document.getElementById("insertion-point")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// registerServiceWorker();
