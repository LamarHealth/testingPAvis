import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import "./index.css";
import App from "./App";
import styled from "styled-components";
import * as serviceWorker from "./serviceWorker";
// blueprintjs
import "@blueprintjs/core/lib/css/blueprint.css";

// Load dotenv
import dotenv from "dotenv";
dotenv.config();

$(
  '<div id="insertion-point" style="width:100%;height:100%;z-index:99999;position:fixed;" />'
).insertBefore(document.body);
ReactDOM.render(<App />, document.getElementById("insertion-point"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// registerServiceWorker();
