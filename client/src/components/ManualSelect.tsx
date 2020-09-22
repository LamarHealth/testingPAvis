import React, { useState, useEffect, createContext, useContext } from "react";

import useImage from "use-image";
import styled from "styled-components";
import { Rnd, RndResizeCallback, DraggableData } from "react-rnd";

import { KeyValuesByDoc } from "./KeyValuePairs";
import { useStore } from "../contexts/ZustandStore";
import { MainModalContext } from "./RenderModal";
import { KonvaModal } from "./KonvaModal";
import WrappedJssComponent from "./ShadowComponent";
import { renderBlankChiclet } from "./AccuracyScoreCircle";

import uuidv from "uuid";
import { colors } from "../common/colors";
import {
  API_PATH,
  DOC_IMAGE_WIDTH,
  KONVA_MODAL_HEIGHT,
  MODAL_SHADOW,
} from "../common/constants";

const StyledRnD = styled(Rnd)`
  background: #f0f0f0;
  position: absolute;
  height: ${KONVA_MODAL_HEIGHT}px;
  overflow-y: scroll;
  border: 1px solid ${colors.MODAL_BORDER};
  box-shadow: ${MODAL_SHADOW};
`;

export const KonvaModalContext = createContext({} as any);

export const ManualSelect = ({ eventTarget }: any) => {
  const [docImageURL, setDocImageURL] = useState({} as any);
  const [currentLinesGeometry, setCurrentLinesGeometry] = useState([] as any);
  const [currentDocID, setCurrentDocID] = useState("" as any);
  const [currentSelection, setCurrentSelection] = useState({} as any);
  const selectedFile = useStore((state) => state.selectedFile);
  const setSelectedChiclet = useStore((state) => state.setSelectedChiclet);
  const [image] = useImage(docImageURL.url);
  const [filled, setFilled] = useState({} as any);
  const docData = useStore((state) => state.docData);
  const {
    setKvpTableAnchorEl,
    konvaModalOpen,
    setKonvaModalOpen,
    konvaModalDraggCoords,
    setKonvaModalDraggCoords,
    konvaModalDimensions,
    setKonvaModalDimensions,
    docImageDimensions,
    setDocImageDimensions,
    errorFetchingImage,
    setErrorFetchingImage,
    errorFetchingGeometry,
    setErrorFetchingGeometry,
    setErrorMessage,
    setErrorCode,
  } = useContext(MainModalContext);

  // modal
  const modalHandleClick = () => {
    if (
      konvaModalOpen === true &&
      (currentDocID === "" ||
        currentDocID !== selectedFile ||
        errorFetchingImage ||
        errorFetchingGeometry)
    ) {
      getImageAndGeometryFromServer(selectedDocData);
    }
  };
  const isDocImageSet = Boolean(docImageURL.heightXWidthMutliplier);
  useEffect(modalHandleClick, [konvaModalOpen]);

  // geometry
  const selectedDocData = docData.filter(
    (doc: KeyValuesByDoc) => doc.docID === selectedFile
  )[0];

  const getImageAndGeometryFromServer = async (doc: KeyValuesByDoc) => {
    const docName = doc.docName;
    const docID = doc.docID;
    doc.docType = doc.docType === "pdf" ? "png" : doc.docType;
    const docType = doc.docType;
    setCurrentDocID(docID);

    // get image
    const docImageResponse: any = await fetch(
      `${API_PATH}/api/doc-image/${docID}/${encodeURIComponent(`
        ${docName}.${docType}`)}`,
      {
        method: "GET",
      }
    );

    switch (docImageResponse.status) {
      case 200:
        setErrorFetchingImage(false);
        const blob = await docImageResponse.blob();
        const objectURL = await URL.createObjectURL(blob);

        const img = new Image();
        img.src = objectURL;
        img.onload = function (this: any) {
          const url = objectURL;
          const heightXWidthMutliplier = this.naturalHeight / this.naturalWidth;

          // if the first time an image is loaded, then set the img dim to a specified default. img dim are updated from resizing.
          if (docImageDimensions.height === 0) {
            setDocImageDimensions(() => {
              const width = DOC_IMAGE_WIDTH;
              const height = DOC_IMAGE_WIDTH * heightXWidthMutliplier;
              return { width, height };
            });
          }

          setDocImageURL({
            url,
            heightXWidthMutliplier,
          });
        };
        break;
      case 410:
        setErrorFetchingImage(true);
        setErrorCode(docImageResponse.status);
        const statusMessage = (await docImageResponse.json()).status;
        setErrorMessage(statusMessage);
        break;
      default:
        setErrorFetchingImage(true);
        setErrorCode(docImageResponse.status);
    }

    // get geometry
    const linesGeometryResponse: any = await fetch(
      `${API_PATH}/api/lines-geometry/${docID}/${encodeURIComponent(`
    ${docName}`)}`,
      {
        method: "GET",
      }
    );

    switch (linesGeometryResponse.status) {
      case 200:
        setErrorFetchingGeometry(false);
        const linesGeometry = (
          await linesGeometryResponse.json()
        ).linesGeometry.map((lineGeometry: any) => {
          //@ts-ignore
          return { ...lineGeometry, ID: uuidv() };
        });
        setCurrentLinesGeometry(linesGeometry);
        break;
      case 410:
        setErrorFetchingGeometry(true);
        setErrorCode(linesGeometryResponse.status);
        const statusMessage = (await linesGeometryResponse.json()).status;
        setErrorMessage(statusMessage);
        break;
      default:
        setErrorFetchingGeometry(true);
        setErrorCode(linesGeometryResponse.status);
    }
  };

  // return key listener
  useEffect(() => {
    // needs to be inside useEffect so can reference the same instance of the callback function so can remove on cleanup
    function keydownListener(e: any) {
      if (e.keyCode === 13) {
        setKonvaModalOpen(false);
        setKvpTableAnchorEl(null);
        setSelectedChiclet("");
        renderBlankChiclet(eventTarget);
        eventTarget.value = Object.keys(currentSelection)
          .map((key) => currentSelection[key])
          .join(" ");
      }
    }
    document.addEventListener("keydown", keydownListener);
    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [currentSelection]);

  // drag & resize
  const handleDragStop = (e: any, data: DraggableData) => {
    const [x, y] = [data.x, data.y];
    setKonvaModalDraggCoords({ x, y });
  };

  const handleResizeStop: RndResizeCallback = (
    e,
    dir,
    refToElement,
    delta,
    position
  ) => {
    const [width, height] = [
      parseInt(refToElement.style.width.replace("px", "")),
      parseInt(refToElement.style.height.replace("px", "")),
    ];
    const [x, y] = [position.x, position.y];

    setKonvaModalDimensions({ width, height }); // set new modal dim
    setKonvaModalDraggCoords({ x, y }); // set coords after drag
    setDocImageDimensions({
      // set doc img dim
      width,
      height: width * docImageURL.heightXWidthMutliplier,
    });
  };

  return (
    <React.Fragment>
      {!errorFetchingGeometry && !errorFetchingImage && isDocImageSet && (
        <WrappedJssComponent wrapperClassName={"shadow-root-for-modals"}>
          <StyledRnD
            position={konvaModalDraggCoords}
            onDragStop={handleDragStop}
            bounds="window"
            size={konvaModalDimensions}
            onResizeStop={handleResizeStop}
          >
            <div>
              <KonvaModalContext.Provider
                value={{
                  currentSelection,
                  image,
                  filled,
                  setFilled,
                  setCurrentSelection,
                  currentLinesGeometry,
                  setKonvaModalOpen,
                  docImageDimensions,
                }}
              >
                <KonvaModal />
              </KonvaModalContext.Provider>
            </div>
          </StyledRnD>
        </WrappedJssComponent>
      )}
    </React.Fragment>
  );
};
