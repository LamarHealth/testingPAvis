import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Dialog } from "@blueprintjs/core";
import { colors } from "./../common/colors";
import { useState as useSpecialHookState } from "@hookstate/core";

import { getKeyValuePairsByDoc, KeyValuesByDoc } from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";

const ManualSelectWrapper = styled.div`
  width: 100%;

  h4 {
    margin: 0.4em;
    margin-left: 1em;
  }
`;

const ManualSelectButton = styled.button`
  border: 1px solid white;
  border-radius: 5px;
  font-weight: bold;
  background-color: #f9e526;
  padding: 0.3em 1.3em;
  margin: 0 0.4em 0.4em 1em;

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
  const [currentLinesGeometry, setCurrentLinesGeometry] = useState([] as any);

  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);

  const docData = getKeyValuePairsByDoc();

  const selectedDocData = docData.filter(
    (doc) => doc.docID === globalSelectedFile.get()
  )[0];

  const getImageAndGeometryFromServer = async (doc: KeyValuesByDoc) => {
    const docName = doc.docName;
    const docType = doc.docType;
    const docID = doc.docID;

    // get doc image
    const docImageResponse: any = await fetch(
      `/api/doc-image/${docID}/${encodeURIComponent(`
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
      `/api/lines-geometry/${docID}/${encodeURIComponent(`
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

  const clickHandler = () => {
    setOverlayOpen(true);
    getImageAndGeometryFromServer(selectedDocData);
  };

  return (
    <ManualSelectWrapper>
      <div>
        <h4>{selectedDocData.docName}</h4>
      </div>
      <ManualSelectButton onClick={clickHandler}>
        Manual Select
      </ManualSelectButton>
      <ManualSelectOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      >
        <ManualSelectCanvas id="overlay-canvas"></ManualSelectCanvas>
      </ManualSelectOverlay>
    </ManualSelectWrapper>
  );
};
