import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

// Load dotenv
import dotenv from "dotenv";
import ShipmentsDashboard from "./shipments/ShipmentsDashboard";
import { Sidebar } from "./shipments/Sidebar";
import { RenderModal } from "./shipments/RenderModal";

import { LOCAL_MODE } from "./common/constants";
dotenv.config();

$('<span id="insertion-point"/>').insertBefore(document.body);
console.log(process.env);
ReactDOM.render(
  <>
    <RenderModal />
    <Sidebar />
    {LOCAL_MODE && (
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
