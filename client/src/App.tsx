import React, { createContext } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

// Load dotenv
import dotenv from "dotenv";
import ShipmentsDashboard from "./components/ShipmentsDashboard";
import { Sidebar } from "./components/Sidebar";
import { RenderModal } from "./components/RenderModal";
import { RenderAutocomplete } from "./components/RenderAutocomplete";
import ManualSelectNewTab from "./components/ManualSelectNewTab";

import { LOCAL_MODE, Z_INDEX_ALLOCATOR } from "./common/constants";
dotenv.config();

export const SampleContext = createContext({} as any);

const MainApp = () => {
  return (
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
    </>
  );
};

export const App = () => {
  return (
    <>
      <Router>
        <Route path="/" exact component={MainApp} />
        <Route path="/viewdoc/:docID" exact component={ManualSelectNewTab} />
      </Router>
    </>
  );
};
