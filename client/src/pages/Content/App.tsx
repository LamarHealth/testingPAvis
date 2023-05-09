import React from "react";

import { Sidebar } from "./components/Sidebar";
import { RenderAutocomplete } from "./components/RenderAutocomplete";

import { LOCAL_MODE, Z_INDEX_ALLOCATOR } from "./common/constants";
import { PdfViewer } from "./components/PdfViewer";

export const App = () => {
  return (
    <>
      <PdfViewer />
      <RenderAutocomplete />
      <Sidebar />
      {LOCAL_MODE && (
        <body
          style={{
            position: "relative",
            zIndex: Z_INDEX_ALLOCATOR.body(),
          }}
        ></body>
      )}
    </>
  );
};
