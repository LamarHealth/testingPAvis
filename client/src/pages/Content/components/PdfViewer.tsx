import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { degrees, PDFDocument, rgb } from "pdf-lib";
import { Table, Line } from "../../../types/documents";

export const Modal = ({ children }: { children: React.ReactNode }) => {
  const modalRoot = document.createElement("div");
  modalRoot.id = "modal-root";
  modalRoot.style.position = "fixed";
  modalRoot.style.top = "0";
  modalRoot.style.left = "0";
  modalRoot.style.width = "100%";
  modalRoot.style.height = "100%";
  modalRoot.style.zIndex = "1000";

  useEffect(() => {
    document.body.appendChild(modalRoot);
    console.log("hola??");
    return () => {
      document.body.removeChild(modalRoot);
    };
  }, []);

  return createPortal(children, modalRoot);
};

const PdfViewer = () => {
  async function modifyPdf(pdfUrl: string, jsonUrl: string) {
    // Fetch an existing PDF document
    console.log("getting pdf");
    const existingPdfBytes = await fetch(pdfUrl)
      .then((res) => res.arrayBuffer())
      .catch((err) => console.log("pdf", err));

    console.log("getting json");
    const json = await fetch(jsonUrl)
      .then((res) => res.json())
      .catch((err) => console.log("json", err));

    // Load a PDFDocument from the existing PDF bytes
    // @ts-ignore
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

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

    document.querySelector("#pdf").appendChild(pdfNode);
  }

  function callModify() {
    modifyPdf("/estrada.pdf", "../estrada.json");
  }

  return (
    <div className="App">
      <p>
        Click the button to modify an existing PDF document with{" "}
        <code>pdf-lib</code>
      </p>
      <button onClick={callModify}>Modify PDF</button>
      <div id="pdf"></div>
    </div>
  );
};
