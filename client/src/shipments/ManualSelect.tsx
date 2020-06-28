import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Dialog, HTMLTable } from "@blueprintjs/core";

import { getKeyValuePairsByDoc, KeyValuesByDoc } from "./KeyValuePairs";

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
  box-sizing: border-box;
`;

export const ManualSelect = (props: { eventObj: any }) => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [canvasSrc, setCanvasSrc] = useState("");
  const [currentlyOpenDoc, setCurrentlyOpenDoc] = useState("");

  const docDataByDoc = getKeyValuePairsByDoc();

  const getDocsFromServer = async (doc: KeyValuesByDoc) => {
    // folders can only contain lowercase letters and dashes. this regex is exact copy of the one on the server
    const docName = doc.docName;
    const docType = doc.docType;

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
    setCurrentlyOpenDoc(docName);
  };

  useEffect(() => {
    // render image
    // method: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    const canvas: any = document.querySelector("#overlay-canvas");

    if (canvas === null) {
      return;
    }
    const ctx: any = canvas.getContext("2d");

    var img = new Image();
    img.onload = drawImageActualSize;
    img.src = canvasSrc;

    const recCoords = {
      xDist: 50,
      yDist: 50,
      height: 50,
      width: 50,
    };

    function drawImageActualSize(this: any) {
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);

      // render rectangles

      ctx.strokeStyle = "red";
      ctx.strokeRect(
        recCoords.xDist,
        recCoords.yDist,
        recCoords.width,
        recCoords.height
      );
    }

    canvas.addEventListener(
      "click",
      (e: any) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left; //x position within the element.
        const y = e.clientY - rect.top; //y position within the element.

        if (
          x > recCoords.xDist &&
          x < recCoords.xDist + recCoords.width &&
          y > recCoords.yDist &&
          y < recCoords.yDist + recCoords.height
        ) {
          setOverlayOpen(false);
          props.eventObj.target.value = currentlyOpenDoc;
        }
      },
      false
    );
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
                getDocsFromServer(doc);
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
