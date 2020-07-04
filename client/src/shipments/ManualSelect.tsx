import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Dialog } from "@blueprintjs/core";
import { colors } from "./../common/colors";
import { useState as useSpecialHookState } from "@hookstate/core";

import { getKeyValuePairsByDoc, KeyValuesByDoc } from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";

import uuidv from "uuid";

import Konva from "konva";

import { AsyncResource } from "async_hooks";

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
  const [imageIsRendered, setImageIsRendered] = useState(false);

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

    const linesGeometry = (
      await linesGeometryResponse.json()
    ).linesGeometry.map((lineGeometry: any) => {
      //@ts-ignore
      return { ...lineGeometry, ID: uuidv() };
    });

    setCurrentLinesGeometry(linesGeometry);
  };

  const renderBackgroundImage = () => {
    const img = new Image();
    img.src = docImageURL;
    img.onload = onLoadDraw;

    function onLoadDraw(this: any) {
      const konvaContainer: any = document.querySelector("#konva-container");
      if (konvaContainer === null) return;

      konvaContainer.style.width = `${this.naturalWidth}px`;
      konvaContainer.style.height = `${this.naturalHeight}px`;

      konvaContainer.style.backgroundImage = `url(${docImageURL})`;

      setImageIsRendered(true);
    }
  };

  useEffect(renderBackgroundImage, [docImageURL]);

  const drawKonvaAndListen = () => {
    const konvaContainer: any = document.querySelector("#konva-container");

    if (konvaContainer === null) return;
    if (currentLinesGeometry.length === 0) return;

    const containerHeight = konvaContainer.style.height.replace("px", "");
    const containerWidth = konvaContainer.style.width.replace("px", "");

    const stage = new Konva.Stage({
      container: "konva-container",
      width: containerWidth,
      height: containerHeight,
    });

    const layer = new Konva.Layer();

    let scopedCurrentSelection = {} as any;

    currentLinesGeometry.forEach((lineGeometry: any) => {
      let points = [] as any;
      lineGeometry.Coordinates.forEach((coordinatePair: any) => {
        points.push(containerWidth * coordinatePair.X);
        points.push(containerHeight * coordinatePair.Y);
      });
      const poly = new Konva.Line({
        points: points,
        fill: "transparent",
        stroke: colors.MANUAL_SELECT_RECT_STROKE,
        strokeWidth: 1,
        closed: true,
      });

      let filled = false;

      poly.on("mouseover touchstart", function () {
        if (filled) return;
        this.fill(colors.MANUAL_SELECT_RECT_FILL);
        layer.draw();
      });
      poly.on("mouseout touchend", function () {
        if (filled) return;
        this.fill("transparent");
        layer.draw();
      });
      poly.on("click", function () {
        if (!filled) {
          setCurrentSelection((prevCurrentSelection: any) => {
            return {
              ...prevCurrentSelection,
              [lineGeometry.ID]: lineGeometry.Text,
            };
          });
          scopedCurrentSelection[lineGeometry.ID] = lineGeometry.Text;
          this.fill(colors.MANUAL_SELECT_RECT_FILL);
          filled = true;
        } else {
          setCurrentSelection((prevCurrentSelection: any) => {
            delete prevCurrentSelection[lineGeometry.ID];
            return { ...prevCurrentSelection };
          });
          delete scopedCurrentSelection[lineGeometry.ID];
          filled = false;
        }
      });

      layer.add(poly);
    });

    document.addEventListener("keydown", (e: any) => {
      // return key
      if (e.keyCode === 13) {
        setOverlayOpen(false);
        props.eventObj.target.value = Object.keys(scopedCurrentSelection)
          .map((key) => scopedCurrentSelection[key])
          .join(" ");
      }
    });

    stage.add(layer);
  };

  useEffect(drawKonvaAndListen, [imageIsRendered, currentLinesGeometry]);

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
              document.getElementById("konva-container")?.offsetWidth
            }px`,
          }}
        >
          <p>
            <i>
              <strong>Click</strong> to select a line; <strong>Click</strong>{" "}
              again to unselect; press <strong>Return</strong> key to fill.
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
        <div id="konva-container"></div>
      </ManualSelectOverlay>
    </ManualSelectWrapper>
  );
};
