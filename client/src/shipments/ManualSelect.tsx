import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Dialog, HTMLTable } from "@blueprintjs/core";

import { getKeyValuePairsByDoc } from "./KeyValuePairs";

const ManualSelectButton = styled.button`
  border: 1px solid white;
  border-radius: 5px;
  font-weight: bold;
  background-color: #f9e526;
  padding: 0.3em 0.7em;

  :hover {
    opacity: 0.5;
  }
`;

const ManualSelectOverlay = styled(Dialog)`
  width: auto;
  height: auto;
`;

const ManualSelectCanvas = styled.canvas`
  height: 100%;
  width: 100%;
`;

export const ManualSelect = () => {
  const docDataByDoc = getKeyValuePairsByDoc();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [canvasSrc, setCanvasSrc] = useState("");

  const getDocsFromServer = async (docName: string, docType: string) => {
    // folders can only contain lowercase letters and dashes. this regex is exact copy of the one on the server
    let folderifiedDocName = (docName + "." + docType)
      .toLowerCase()
      .replace(/(.pdf)$/i, ".png")
      .replace(/[  !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/gi, "-")
      .replace(/(-)+/gi, "-");

    const response: any = await fetch(
      `/api/docs/${folderifiedDocName}/${encodeURIComponent(`
        ${docName}.${docType}`)}`,
      {
        method: "GET",
      }
    );

    const blob = await response.blob();
    const objectURL = await URL.createObjectURL(blob);

    setCanvasSrc(objectURL);
  };

  useEffect(() => {
    // method: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    const canvas: any = document.querySelector("#overlay-canvas");
    if (canvas === null) {
      return;
    }
    const ctx: any = canvas.getContext("2d");

    var img = new Image();
    img.onload = drawImageActualSize;
    img.src = canvasSrc;

    function drawImageActualSize(this: any) {
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);
    }
  });

  return (
    <HTMLTable>
      <tbody>
        <tr>
          <td>
            <i>
              <strong>manual select</strong>
            </i>
          </td>
          <td>
            {docDataByDoc.map((doc: any) => {
              const clickHandler = () => {
                setOverlayOpen(true);
                getDocsFromServer(doc.docName, doc.docType);
              };

              return (
                <div>
                  <ManualSelectButton onClick={clickHandler}>
                    {doc.docName}
                  </ManualSelectButton>
                </div>
              );
            })}
          </td>
        </tr>
      </tbody>
      <ManualSelectOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      >
        <ManualSelectCanvas id="overlay-canvas"></ManualSelectCanvas>
      </ManualSelectOverlay>
    </HTMLTable>
  );
};
