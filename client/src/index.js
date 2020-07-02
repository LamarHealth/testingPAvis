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

const initialContent = `<!DOCTYPE html><html><head>${document.head.innerHTML}</head><div></div></html>`;
const SideBarFrame = styled(Frame)`
  border: none;
  display: block;
  overflow: hidden;
  left: auto;
  float: none;
  height: 100vh;
  background: transparent;
`;

$('<span id="insertion-point"/>').insertBefore(document.body);

ReactDOM.render(
  <>
    <Sidebar>
      <SideBarFrame initialContent={initialContent}>
        <FrameContextConsumer>
          {(frameContext) => (
            <StyleSheetManager target={frameContext.document.head}>
              <DocViewer />
            </StyleSheetManager>
          )}
        </FrameContextConsumer>
      </SideBarFrame>
    </Sidebar>
    {!process.env.LOCAL && (
      <body>
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
