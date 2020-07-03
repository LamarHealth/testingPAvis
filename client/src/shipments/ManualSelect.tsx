import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Dialog } from "@blueprintjs/core";
import { colors } from "./../common/colors";
import { useState as useSpecialHookState } from "@hookstate/core";

import { getKeyValuePairsByDoc, KeyValuesByDoc } from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";

import uuidv from "uuid";

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

const CurrentSelectionWrapper = styled.div`
  padding: 1em 2em;
  background-color: ${colors.CLOSEST_MATCH_ROW};

  h3 {
    margin: 0.8em 0 0.5em 0;
  }
`;

const CurrentSelection = styled.p`
  margin: 0;
  background-color: ${colors.CURRENT_SELECTION_LIGHTBLUE};
  padding: 1em;
  border-radius: 5px;
  border: 0.5px solid ${colors.FONT_BLUE};
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
  const [currentSelection, setCurrentSelection] = useState({} as any);

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

      const getSlopeIntercept = (
        x0: number,
        y0: number,
        x1: number,
        y1: number
      ) => {
        let slope = (y0 - y1) / (x0 - x1);
        let findYGivenX = (X: number) => {
          const Y = slope * (X - x1) + y1;
          return Y;
        };

        let findXGivenY = (Y: number) => {
          const X = (Y - y1 + slope * x1) / slope;
          return X;
        };
        return { findYGivenX, findXGivenY, slope };
      };

      // render rectangles
      let scopedCurrentSelection = {} as any;
      if (currentLinesGeometry.length > 0) {
        currentLinesGeometry.forEach((lineGeometry: any) => {
          ctx.strokeStyle = colors.MANUAL_SELECT_RECT_STROKE;

          const polygonCoords: any = [
            {
              x: canvas.width * lineGeometry.Coordinates[0].X,
              y: canvas.height * lineGeometry.Coordinates[0].Y,
            },
            {
              x: canvas.width * lineGeometry.Coordinates[1].X,
              y: canvas.height * lineGeometry.Coordinates[1].Y,
            },
            {
              x: canvas.width * lineGeometry.Coordinates[2].X,
              y: canvas.height * lineGeometry.Coordinates[2].Y,
            },
            {
              x: canvas.width * lineGeometry.Coordinates[3].X,
              y: canvas.height * lineGeometry.Coordinates[3].Y,
            },
          ];

          if (
            getSlopeIntercept(
              polygonCoords[1].x,
              polygonCoords[1].y,
              polygonCoords[2].x,
              polygonCoords[2].y
            ).slope === (Infinity || -Infinity) ||
            getSlopeIntercept(
              polygonCoords[3].x,
              polygonCoords[3].y,
              polygonCoords[0].x,
              polygonCoords[0].y
            ).slope === (Infinity || -Infinity)
          ) {
            ////// RECTANGLES //////
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

            ctx.strokeRect(
              rectangleCoords.xDist,
              rectangleCoords.yDist,
              rectangleCoords.width,
              rectangleCoords.height
            );

            // fill in the selected lines
            //@ts-ignore
            const rectangleID = uuidv();
            let filled = false;
            let shiftFilled = false;
          } else {
            ////// POLYGONS //////
            ctx.beginPath();
            ctx.moveTo(polygonCoords[0].x, polygonCoords[0].y);
            ctx.lineTo(polygonCoords[1].x, polygonCoords[1].y);
            ctx.lineTo(polygonCoords[2].x, polygonCoords[2].y);
            ctx.lineTo(polygonCoords[3].x, polygonCoords[3].y);
            ctx.lineTo(polygonCoords[0].x, polygonCoords[0].y);
            ctx.stroke();

            // fill in the selected lines
            //@ts-ignore
            const rectangleID = uuidv();
            let filled = false;
            let shiftFilled = false;

            canvas.addEventListener(
              "click",
              (e: any) => {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left; //x position within the element.
                const y = e.clientY - rect.top; //y position within the element.

                const lowerThanLine0 =
                  getSlopeIntercept(
                    polygonCoords[0].x,
                    polygonCoords[0].y,
                    polygonCoords[1].x,
                    polygonCoords[1].y
                  ).findYGivenX(x) < y;

                const leftOfLine1 =
                  getSlopeIntercept(
                    polygonCoords[1].x,
                    polygonCoords[1].y,
                    polygonCoords[2].x,
                    polygonCoords[2].y
                  ).findXGivenY(y) > x;

                const aboveLine2 =
                  getSlopeIntercept(
                    polygonCoords[2].x,
                    polygonCoords[2].y,
                    polygonCoords[3].x,
                    polygonCoords[3].y
                  ).findYGivenX(x) > y;

                const rightOfLine3 =
                  getSlopeIntercept(
                    polygonCoords[3].x,
                    polygonCoords[3].y,
                    polygonCoords[0].x,
                    polygonCoords[0].y
                  ).findXGivenY(y) < x;

                const mouseInThePolygon =
                  lowerThanLine0 && leftOfLine1 && aboveLine2 && rightOfLine3;

                if (mouseInThePolygon) console.log(lineGeometry.Text);

                console.log("lowerThanLine0, ", lowerThanLine0);
                console.log("leftOfLine1, ", leftOfLine1);

                console.log(
                  getSlopeIntercept(
                    polygonCoords[3].x,
                    polygonCoords[3].y,
                    polygonCoords[0].x,
                    polygonCoords[0].y
                  ).slope
                );

                // if (mouseInThePolygon) {
                //   setCurrentSelection((prevCurrentSelection: any) => {
                //     return {
                //       ...prevCurrentSelection,
                //       [rectangleID]: lineGeometry.Text,
                //     };
                //   });
                //   // need locally-scoped version because these functions are not rendering a second time; see useEffect dependency list below
                //   scopedCurrentSelection[rectangleID] = lineGeometry.Text;

                //   if (!shiftFilled && e.shiftKey) {
                //     ctx.clearRect(
                //       rectangleCoords.xDist + 1,
                //       rectangleCoords.yDist + 1,
                //       rectangleCoords.width - 1.5,
                //       rectangleCoords.height - 1.5
                //     );

                //     ctx.fillStyle = colors.MANUAL_SELECT_RECT_FILL;

                //     ctx.fillRect(
                //       rectangleCoords.xDist,
                //       rectangleCoords.yDist,
                //       rectangleCoords.width,
                //       rectangleCoords.height
                //     );
                //     shiftFilled = true;
                //   } else if (shiftFilled && e.shiftKey) {
                //     setCurrentSelection((prevCurrentSelection: any) => {
                //       delete prevCurrentSelection[rectangleID];
                //       return { ...prevCurrentSelection };
                //     });
                //     delete scopedCurrentSelection[rectangleID];

                //     ctx.clearRect(
                //       rectangleCoords.xDist + 1,
                //       rectangleCoords.yDist + 1,
                //       rectangleCoords.width - 1.5,
                //       rectangleCoords.height - 1.5
                //     );
                //     shiftFilled = false;
                //   }

                //   if (!e.shiftKey) {
                //     setOverlayOpen(false);

                //     props.eventObj.target.value = Object.keys(
                //       scopedCurrentSelection
                //     )
                //       .map((key) => scopedCurrentSelection[key])
                //       .join(" ");
                //   }
                // }
              },
              false
            );

            // backgroun green fill for boxes when mouseover
            canvas.addEventListener(
              "mousemove",
              (e: any) => {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left; //x position within the element.
                const y = e.clientY - rect.top; //y position within the element.

                const lowerThanLine0 =
                  getSlopeIntercept(
                    polygonCoords[0].x,
                    polygonCoords[0].y,
                    polygonCoords[1].x,
                    polygonCoords[1].y
                  ).findYGivenX(x) < y;

                const leftOfLine1 =
                  getSlopeIntercept(
                    polygonCoords[1].x,
                    polygonCoords[1].y,
                    polygonCoords[2].x,
                    polygonCoords[2].y
                  ).findXGivenY(y) > x;

                const aboveLine2 =
                  getSlopeIntercept(
                    polygonCoords[2].x,
                    polygonCoords[2].y,
                    polygonCoords[3].x,
                    polygonCoords[3].y
                  ).findYGivenX(x) > y;

                const rightOfLine3 =
                  getSlopeIntercept(
                    polygonCoords[3].x,
                    polygonCoords[3].y,
                    polygonCoords[0].x,
                    polygonCoords[0].y
                  ).findXGivenY(y) < x;

                const mouseInThePolygon =
                  lowerThanLine0 && leftOfLine1 && aboveLine2 && rightOfLine3;

                if (mouseInThePolygon && !filled) {
                  ctx.fillStyle = colors.MANUAL_SELECT_RECT_FILL;

                  ctx.beginPath();
                  ctx.moveTo(polygonCoords[0].x, polygonCoords[0].y);
                  ctx.lineTo(polygonCoords[1].x, polygonCoords[1].y);
                  ctx.lineTo(polygonCoords[2].x, polygonCoords[2].y);
                  ctx.lineTo(polygonCoords[3].x, polygonCoords[3].y);
                  ctx.lineTo(polygonCoords[0].x, polygonCoords[0].y);
                  ctx.fill();

                  // need to set this back to black or will get weird buggy stuff
                  ctx.fillStyle = "#000000";

                  filled = true;
                }

                if (!(mouseInThePolygon && filled) && !shiftFilled) {
                  ctx.globalCompositeOperation = "destination-out";

                  // blank out the entire polygon
                  ctx.beginPath();
                  ctx.moveTo(polygonCoords[0].x - 1, polygonCoords[0].y - 1);
                  ctx.lineTo(polygonCoords[1].x + 1, polygonCoords[1].y - 1);
                  ctx.lineTo(polygonCoords[2].x + 1, polygonCoords[2].y + 1);
                  ctx.lineTo(polygonCoords[3].x - 1, polygonCoords[3].y + 1);
                  ctx.lineTo(polygonCoords[0].x - 1, polygonCoords[0].y - 1);
                  ctx.closePath();
                  ctx.fill();

                  // draw a new one
                  ctx.globalCompositeOperation = "source-over";

                  ctx.strokeStyle = colors.MANUAL_SELECT_RECT_STROKE;

                  ctx.beginPath();
                  ctx.moveTo(polygonCoords[0].x, polygonCoords[0].y);
                  ctx.lineTo(polygonCoords[1].x, polygonCoords[1].y);
                  ctx.lineTo(polygonCoords[2].x, polygonCoords[2].y);
                  ctx.lineTo(polygonCoords[3].x, polygonCoords[3].y);
                  ctx.lineTo(polygonCoords[0].x, polygonCoords[0].y);
                  ctx.stroke();

                  filled = false;
                }
              },
              false
            );
          }
        });
      }
    }
  };

  useEffect(drawOnCanvasAndHandleClicks, [docImageURL, currentLinesGeometry]);

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
        <CurrentSelectionWrapper
          style={{
            width: `${
              document.getElementById("overlay-canvas")?.offsetWidth
            }px`,
          }}
        >
          <p>
            <i>
              <strong>Shift + Click</strong> to select multiple lines at once;{" "}
              <strong>Shift + Click</strong> to unselect; <strong>Click</strong>{" "}
              to fill.
            </i>
          </p>
          {Object.keys(currentSelection).length > 0 && (
            <div>
              <p>
                <strong>Current Selection:</strong>
              </p>
              <CurrentSelection>
                {Object.keys(currentSelection).map(
                  (key, i) => currentSelection[key] + " "
                )}
              </CurrentSelection>
            </div>
          )}
        </CurrentSelectionWrapper>
        <ManualSelectCanvas id="overlay-canvas"></ManualSelectCanvas>
      </ManualSelectOverlay>
    </ManualSelectWrapper>
  );
};
