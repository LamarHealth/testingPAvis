import React from "react";
import { degrees, PDFDocument, rgb } from "pdf-lib";

const PdfViewer = () => {
  const modifyPdf = (pdfUrl: string, jsonUrl: string): Promise<void> => {
    return new Promise(async (resolve) => {
      // Fetch an existing PDF document
      const existingPdfBytes = await fetch(pdfUrl).then((res) =>
        res.arrayBuffer()
      );
      const coordinates = await fetch(jsonUrl).then((res) => res.json());

      // Load a PDFDocument from the existing PDF bytes
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      coordinates.forEach((entry: any) => {
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
      pdfNode.setAttribute("src", fileURL + "#page=4");

      document.querySelector("#pdf")?.appendChild(pdfNode);
      resolve();
    });
  };

  const callModify = () => {
    modifyPdf("/page4.pdf", "page4v2.json");
  };

  return (
    <div className="App">
      <p>
        Click the button to modify an existing PDF document with{" "}
        <code>pdf-lib</code>
      </p>
      <button onClick={callModify}>Modify PDF</button>
      <div id="pdf" style={{ width: "100%", height: "1000px" }}></div>
    </div>
  );
};

export default PdfViewer;
