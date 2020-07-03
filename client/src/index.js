import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import $ from "jquery";

// Load dotenv
import dotenv from "dotenv";
import ShipmentsDashboard from "./shipments/ShipmentsDashboard";
import DocViewer from "./shipments/DocViewer";
import { Sidebar } from "./shipments/Sidebar";
dotenv.config();

$('<span id="insertion-point"/>').insertBefore(document.body);

ReactDOM.render(
  <>
    <Sidebar>
      <DocViewer />
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
