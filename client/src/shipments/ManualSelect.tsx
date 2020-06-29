import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Dialog, HTMLTable } from "@blueprintjs/core";
import { colors } from "./../common/colors";

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
  const [docImageURL, setDocImageURL] = useState("");
  const [currentlyOpenDoc, setCurrentlyOpenDoc] = useState("");
  const [currentLinesGeometry, setCurrentLinesGeometry] = useState([] as any);

  const docDataByDoc = getKeyValuePairsByDoc();

  const getImageAndGeometryFromServer = async (doc: KeyValuesByDoc) => {
    const docName = doc.docName;
    const docType = doc.docType;

    // get doc image
    // folders can only contain lowercase letters and dashes. this regex is exact copy of the one on the server
    let folderifiedDocName = (docName + "." + docType)
      .toLowerCase()
      .replace(/(.pdf)$/i, ".png")
      .replace(/[  !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/gi, "-")
      .replace(/(-)+/gi, "-");

    const docImageResponse: any = await fetch(
      `/api/doc-image/${folderifiedDocName}/${encodeURIComponent(`
        ${docName}.${docType}`)}`,
      {
        method: "GET",
      }
    );

    const blob = await docImageResponse.blob();
    const objectURL = await URL.createObjectURL(blob);

    setDocImageURL(objectURL);

    // get doc field data
    const linesGeometryResponse: any = await fetch(
      `/api/lines-geometry/${folderifiedDocName}/${encodeURIComponent(`
    ${docName}`)}`,
      {
        method: "GET",
      }
    );

    const linesGeometry = (await linesGeometryResponse.json()).linesGeometry;

    setCurrentLinesGeometry(linesGeometry);
  };

  const drawOnCanvasAndHandleClicks = () => {
    // image render method: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    const canvas: any = document.querySelector("#overlay-canvas");

    if (canvas === null) {
      return;
    }
    const ctx: any = canvas.getContext("2d");

    var img = new Image();
    img.onload = drawImageAndRectangles;
    img.src = docImageURL;

    function drawImageAndRectangles(this: any) {
      // render image
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      canvas.style.backgroundImage = `url(${docImageURL})`;

      // render rectangles
      if (currentLinesGeometry.length > 0) {
        currentLinesGeometry.forEach((lineGeometry: any) => {
          const rectangleCoords: any = {
            xDist: canvas.width * lineGeometry.Coordinates[0].X,
            yDist: canvas.height * lineGeometry.Coordinates[0].Y,
            height:
              canvas.height *
              (lineGeometry.Coordinates[2].Y - lineGeometry.Coordinates[1].Y),
            width:
              canvas.width *
              (lineGeometry.Coordinates[1].X - lineGeometry.Coordinates[0].X),
          };

          ctx.strokeStyle = colors.MANUAL_SELECT_RECT_STROKE;

          ctx.strokeRect(
            rectangleCoords.xDist,
            rectangleCoords.yDist,
            rectangleCoords.width,
            rectangleCoords.height
          );

          // fill in the selected line
          canvas.addEventListener(
            "click",
            (e: any) => {
              const rect = e.target.getBoundingClientRect();
              const x = e.clientX - rect.left; //x position within the element.
              const y = e.clientY - rect.top; //y position within the element.

              const mouseInTheRectangle =
                x > rectangleCoords.xDist &&
                x < rectangleCoords.xDist + rectangleCoords.width &&
                y > rectangleCoords.yDist &&
                y < rectangleCoords.yDist + rectangleCoords.height;

              if (mouseInTheRectangle) {
                setOverlayOpen(false);
                props.eventObj.target.value = lineGeometry.Text;
              }
            },
            false
          );

          // backgroun green fill for boxes when mouseover
          let filled = false;
          canvas.addEventListener(
            "mousemove",
            (e: any) => {
              const rect = e.target.getBoundingClientRect();
              const x = e.clientX - rect.left; //x position within the element.
              const y = e.clientY - rect.top; //y position within the element.

              const mouseInTheRectangle =
                x > rectangleCoords.xDist &&
                x < rectangleCoords.xDist + rectangleCoords.width &&
                y > rectangleCoords.yDist &&
                y < rectangleCoords.yDist + rectangleCoords.height;

              if (mouseInTheRectangle && !filled) {
                ctx.fillStyle = colors.MANUAL_SELECT_RECT_FILL;

                ctx.fillRect(
                  rectangleCoords.xDist,
                  rectangleCoords.yDist,
                  rectangleCoords.width,
                  rectangleCoords.height
                );
                filled = true;
              }
              if (!(mouseInTheRectangle && filled)) {
                ctx.clearRect(
                  rectangleCoords.xDist + 1,
                  rectangleCoords.yDist + 1,
                  rectangleCoords.width - 1.5,
                  rectangleCoords.height - 1.5
                );
                filled = false;
              }
            },
            false
          );
        });
      }
    }
  };

  useEffect(drawOnCanvasAndHandleClicks);

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
            {docDataByDoc.map((doc: any, i: number) => {
              const clickHandler = () => {
                setOverlayOpen(true);
                getImageAndGeometryFromServer(doc);
              };

              return (
                <div>
                  <ManualSelectButton key={i} onClick={clickHandler}>
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
