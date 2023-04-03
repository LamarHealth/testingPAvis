import React from "react";

// Load dotenv
import dotenv from "dotenv";
import ShipmentsDashboard from "./components/ShipmentsDashboard";
import { Sidebar } from "./components/Sidebar";
import { RenderModal } from "./components/RenderModal";
import { RenderAutocomplete } from "./components/RenderAutocomplete";

import { LOCAL_MODE, Z_INDEX_ALLOCATOR } from "./common/constants";
dotenv.config();

export const App = () => {
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
