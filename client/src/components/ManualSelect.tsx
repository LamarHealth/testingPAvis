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

export interface LinesGeometry {
  Coordinates: { X: number; Y: number }[];
  ID: string;
  Text: string;
}

interface DocImageURL {
  heightXWidthMultiplier: number;
  url: string;
}

export interface CurrentSelection {
  [lineID: string]: string;
}

export interface Filled {
  [lineID: string]: boolean;
}

export const KonvaModalContext = createContext({} as any);

export const ManualSelect = () => {
  const {
    konvaModalDraggCoords,
    setKonvaModalDraggCoords,
    konvaModalDimensions,
    setKonvaModalDimensions,
    docImageDimensions,
    setDocImageDimensions,
  } = useContext(MainModalContext);
  const [
    eventTarget,
    selectedFile,
    docData,
    konvaModalOpen,
    setKvpTableAnchorEl,
    autocompleteAnchor,
    errorFiles,
    setErrorFiles,
  ] = [
    useStore((state) => state.eventTarget),
    useStore((state) => state.selectedFile),
    useStore((state) => state.docData),
    useStore((state) => state.konvaModalOpen),
    useStore((state) => state.setKvpTableAnchorEl),
    useStore((state) => state.autocompleteAnchor),
    useStore((state) => state.errorFiles),
    useStore((state) => state.setErrorFiles),
  ];
  const [docImageURL, setDocImageURL] = useState({} as DocImageURL);
  const [currentLinesGeometry, setCurrentLinesGeometry] = useState(
    [] as LinesGeometry[]
  );
  const [currentDocID, setCurrentDocID] = useState(
    undefined as string | undefined
  );
  const [currentSelection, setCurrentSelection] = useState(
    {} as CurrentSelection
  );
  const [image] = useImage(docImageURL.url);
  const [filled, setFilled] = useState({} as Filled);
  const [errorLine, setErrorLine] = useState(null as null | string);

  const someErrorGettingThisFile =
    errorFiles[selectedFile] &&
    (errorFiles[selectedFile].image || errorFiles[selectedFile].geometry);

  // modal open
  const modalHandleClick = () => {
    if (
      konvaModalOpen === true &&
      (currentDocID === "" ||
        currentDocID !== selectedFile ||
        someErrorGettingThisFile)
    ) {
      getImageAndGeometryFromServer(selectedDocData);
    }
  };
  useEffect(modalHandleClick, [konvaModalOpen, selectedFile]);
  const isDocImageSet = Boolean(docImageURL.heightXWidthMultiplier);
  !someErrorGettingThisFile && isDocImageSet && setKvpTableAnchorEl(null); // important... close kvp table only when konva modal is displayed

  // data from server
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
        setErrorFiles({ [docID]: { image: false } });
        const blob = await docImageResponse.blob();
        const objectURL = await URL.createObjectURL(blob);

        const img = new Image();
        img.src = objectURL;
        img.onload = function (this: any) {
          const url = objectURL;
          const heightXWidthMultiplier = this.naturalHeight / this.naturalWidth;

          // if the first time an image is loaded, then set the img dim to a specified default. img dim are updated from resizing.
          if (docImageDimensions.height === 0) {
            setDocImageDimensions(() => {
              const width = DOC_IMAGE_WIDTH;
              const height = DOC_IMAGE_WIDTH * heightXWidthMultiplier;
              return { width, height };
            });
          }

          setDocImageURL({
            url,
            heightXWidthMultiplier,
          });
        };
        break;
      case 410:
        const statusMessage = (await docImageResponse.json()).status;
        setErrorFiles({
          [docID]: {
            image: true,
            errorMessage: statusMessage,
            errorCode: docImageResponse.status,
          },
        });
        break;
      default:
        setErrorFiles({
          [docID]: {
            image: true,
            errorCode: docImageResponse.status,
          },
        });
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
        setErrorFiles({ [docID]: { geometry: false } });
        const linesGeometry = (
          await linesGeometryResponse.json()
        ).linesGeometry.map((lineGeometry: any) => {
          //@ts-ignore
          return { ...lineGeometry, ID: uuidv() };
        });
        setCurrentLinesGeometry(linesGeometry);
        break;
      case 410:
        const statusMessage = (await linesGeometryResponse.json()).status;
        setErrorFiles({
          [docID]: {
            geometry: true,
            errorMessage: statusMessage,
            errorCode: linesGeometryResponse.status,
          },
        });
        break;
      default:
        setErrorFiles({
          [docID]: {
            geometry: true,
            errorCode: linesGeometryResponse.status,
          },
        });
    }
  };

  // submit button / enter
  const handleSubmitAndClear = () => {
    if (eventTarget) {
      if (Object.keys(currentSelection).length !== 0) {
        renderBlankChiclet(eventTarget);
        eventTarget.value = Object.keys(currentSelection)
          .map((key) => currentSelection[key])
          .join(" ");
        setErrorLine(null);
        setCurrentSelection({});
        setFilled({});
      } else {
        setErrorLine("Nothing to enter");
      }
    } else {
      setErrorLine("Please select a text input to fill");
    }
  };

  useEffect(() => {
    function keydownListener(e: any) {
      if (e.keyCode === 13) {
        if (!autocompleteAnchor) {
          // don't fire if autocomplete is open
          handleSubmitAndClear();
        }
      }
    }
    document.addEventListener("keydown", keydownListener);
    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [currentSelection, eventTarget, autocompleteAnchor]);

  // clear entries on doc switch
  useEffect(() => {
    setCurrentSelection({});
  }, [selectedFile]);

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
      height: width * docImageURL.heightXWidthMultiplier,
    });
  };

  return (
    <React.Fragment>
      {!someErrorGettingThisFile && isDocImageSet && (
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
                  docImageDimensions,
                  errorLine,
                  setErrorLine,
                  handleSubmitAndClear,
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
