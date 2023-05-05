import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import CloseIcon from "@material-ui/icons/Close";
import { RndComponent } from "./KonvaRndDraggable";
import { useStore, State } from "../contexts/ZustandStore";
import { degrees, PDFDocument, rgb } from "pdf-lib";

import WrappedJssComponent from "./ShadowComponent";
import { FileRequestResponse, Line } from "../../../types/documents";
import { base64ToBlob } from "../../../utils/functions";

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1em 1em;
  border-bottom: 1px solid #ccc;
`;

const PdfContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  border: solid 1px #ccc;
`;

interface PdfViewerProps {
  pdfUrl: string;
  jsonUrl: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = (pdfUrl, jsonUrl) => {
  const { selectedFile, fileUrl, lines, setSelectedFile } = useStore(
    (state: State) => state
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  const modifyPdf = async (pdfUrl: string, lines: Line[]) => {
    try {
      // Fetch an existing PDF document
      console.log("getting pdf");

      chrome.runtime.sendMessage(
        { message: "fileRequest", data: pdfUrl },

        async (response: FileRequestResponse) => {
          console.log("response", response);
          const pdfBlob = base64ToBlob(response.base64file);
          console.log("pdfBlob", pdfBlob);

          const buffer = await pdfBlob.arrayBuffer();

          // Load a PDFDocument from the existing PDF bytes
          const pdfDoc = await PDFDocument.load(buffer);

          console.log("pdfDoc", pdfDoc);

          lines.forEach((entry: Line) => {
            const pages = pdfDoc.getPages();
            const currentPage = pages[entry.Page - 1];
            const { width, height } = currentPage.getSize();
            const box = entry.Geometry.BoundingBox;

            currentPage.drawRectangle({
              x: width * box.Left,
              y: height - height * box.Top,
              width: width * box.Width,
              height: -height * box.Height,
              rotate: degrees(0),
              borderWidth: 1,
              borderColor: rgb(1, 0, 0),
              color: rgb(1, 0, 0),
              opacity: 0.5,
              borderOpacity: 0.75,
            });
          });
          // Serialize the PDFDocument to bytes (a Uint8Array)
          const pdfBytes = await pdfDoc.save();

          const file = new Blob([pdfBytes], { type: "application/pdf" });
          const fileURL = URL.createObjectURL(file);
          const pdfNode = document.createElement("embed");
          // Change node style
          pdfNode.style.width = "100%";
          pdfNode.style.height = "100%";
          pdfNode.style.position = "absolute";
          pdfNode.style.top = "0";
          pdfNode.style.left = "0";
          pdfNode.style.zIndex = "9999";
          pdfNode.style.border = "solid 1px #ccc";

          // To give a page number, use + `fileURL+"#page=4"`
          pdfNode.setAttribute("src", fileURL);

          // Replace the query selector with a React ref
          const container = containerRef.current;
          if (container) {
            container.appendChild(pdfNode);
          }
          console.log("complete...");
        }
      );
    } catch (err) {
      console.log("Error getting pdf arraybuffer", err);
    }
  };

  useEffect(() => {
    console.log("selected", selectedFile);
    selectedFile && modifyPdf(fileUrl, lines);
  }, [selectedFile]);

  const handleOnClick = () => {
    setSelectedFile(null);
  };

  return (
    <>
      {selectedFile && (
        <React.Fragment>
          <WrappedJssComponent wrapperClassName={"shadow-root-for-modals"}>
            <RndComponent>
              <Header id="header">
                <CloseIcon style={{ width: "20px" }} onClick={handleOnClick} />
              </Header>
              <PdfContainer>
                <div id="pdf" ref={containerRef} />
              </PdfContainer>
            </RndComponent>
          </WrappedJssComponent>
        </React.Fragment>
      )}
    </>
  );
};
