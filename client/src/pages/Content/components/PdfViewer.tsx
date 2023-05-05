import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import CloseIcon from "@material-ui/icons/Close";
import { RndComponent } from "./KonvaRndDraggable";
import { useStore, State } from "../contexts/ZustandStore";
import { degrees, PDFDocument, rgb } from "pdf-lib";

import WrappedJssComponent from "./ShadowComponent";
import { FileRequestResponse } from "../../../types/documents";
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
  const { selectedFile, fileUrl, setSelectedFile } = useStore(
    (state: State) => state
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  const modifyPdf = async (pdfUrl: string, jsonUrl: string) => {
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

          const json = [
            {
              Geometry: {
                BoundingBox: {
                  Width: 0.2198616862297058,
                  Height: 0.01800365000963211,
                  Left: 0.07170820236206055,
                  Top: 0.03975728154182434,
                },
                Polygon: [
                  { X: 0.07205525040626526, Y: 0.03975728154182434 },
                  { X: 0.29156988859176636, Y: 0.04220118001103401 },
                  { X: 0.2912239134311676, Y: 0.05776093155145645 },
                  { X: 0.07170820236206055, Y: 0.05531776696443558 },
                ],
              },
              Page: 1,
              Text: "OLD MAN CARGO LINES",
            },
          ];
          json.forEach((entry: any) => {
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

          pdfNode.setAttribute("src", fileURL + "#page=4");

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
    selectedFile && modifyPdf(fileUrl, "https://arxiv.org/abs/1706.03762");
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
