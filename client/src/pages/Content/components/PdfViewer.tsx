import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import CloseIcon from "@material-ui/icons/Close";
import { RndComponent } from "./KonvaRndDraggable";
import {
  useStore,
  State,
  useSelectedDocumentStore,
  SelectedDocumentStoreState,
} from "../contexts/ZustandStore";
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

interface EmbedWrapperProps {
  handleClose: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  fileUrl: string;
  lines: Line[];
}

const EmbedWrapper = ({
  handleClose,
  containerRef,
  fileUrl,
  lines,
}: EmbedWrapperProps) => {
  useEffect(() => {
    modifyPdf(fileUrl, lines);
  }, []);

  const modifyPdf = async (pdfUrl: string, lines: Line[]) => {
    try {
      // Fetch an existing PDF document
      chrome.runtime.sendMessage(
        { message: "fileRequest", data: pdfUrl },

        async (response: FileRequestResponse) => {
          const pdfBlob = base64ToBlob(response.base64file);

          const buffer = await pdfBlob.arrayBuffer();

          // Load a PDFDocument from the existing PDF bytes
          const pdfDoc = await PDFDocument.load(buffer);

          lines.forEach((entry: Line) => {
            const pages = pdfDoc.getPages();
            const currentPage = pages[entry.Page - 1];
            const box = entry.Geometry.BoundingBox;

            const { width, height } = currentPage.getSize();

            // Some documents have a weird 270 degree rotation
            // and need to have the bounding box geometry adjusted
            const adjustedX =
              currentPage.getRotation().angle === 270
                ? width - width * box.Top
                : width * box.Left;

            const adjustedY =
              currentPage.getRotation().angle === 270
                ? height - height * box.Left
                : height - height * box.Top;

            currentPage.drawRectangle({
              x: adjustedX,
              y: adjustedY,
              width: width * box.Width,
              height: -height * box.Height,
              rotate: degrees(currentPage.getRotation().angle),
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
        }
      );
    } catch (err) {
      console.warn("Error getting pdf arraybuffer", err);
    }
  };

  return (
    <React.Fragment>
      <WrappedJssComponent wrapperClassName={"shadow-root-for-modals"}>
        <RndComponent>
          <Header id="header">
            <CloseIcon style={{ width: "20px" }} onClick={handleClose} />
          </Header>
          <PdfContainer>
            <div id="pdf" ref={containerRef} />
          </PdfContainer>
        </RndComponent>
      </WrappedJssComponent>
    </React.Fragment>
  );
};

export const PdfViewer = () => {
  const { konvaModalOpen, selectedLines, setSelectedLines, setKonvaModalOpen } =
    useStore((state: State) => state);

  const [selectedDocument] = [
    useSelectedDocumentStore(
      (state: SelectedDocumentStoreState) => state.selectedDocument
    ),
  ];

  // Line to highlight in PDF
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClose = () => {
    setKonvaModalOpen(false);
    setSelectedLines([]);
  };

  return (
    <>
      {konvaModalOpen && !!selectedDocument && (
        <EmbedWrapper
          handleClose={handleClose}
          containerRef={containerRef}
          fileUrl={selectedDocument.pdf}
          lines={selectedLines.length ? selectedLines : selectedDocument.lines}
        />
      )}
    </>
  );
};
