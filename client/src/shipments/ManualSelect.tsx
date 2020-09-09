import React, { useState, useEffect, createContext, useContext } from "react";

import { useState as useSpecialHookState } from "@hookstate/core";
import useImage from "use-image";
import styled from "styled-components";
import { Rnd, RndResizeCallback, DraggableData } from "react-rnd";

import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Modal from "@material-ui/core/Modal";
import Typography from "@material-ui/core/Typography";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Chip from "@material-ui/core/Chip";

import { getKeyValuePairsByDoc, KeyValuesByDoc } from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";
import { MainModalContext } from "./RenderModal";
import WrappedJssComponent from "./ShadowComponent";
import { KonvaModal } from "./KonvaModal";

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

const CloseButton = styled(IconButton)`
  float: right;
`;

const DocName = styled(Typography)`
  margin: 1em;
`;

const ManualSelectButton = styled(Chip)`
  font-weight: bold;
  background-color: #f9e526;
  padding: 0.3em 1.3em;
  margin: 0 0.4em 0.4em 1em;
`;

export const ErrorMessage = styled(Typography)`
  margin: 1em;
`;

const ErrorLine = (props: { errorCode: number; msg: string }) => {
  return (
    <ErrorMessage>
      <i>
        <strong>Error {props.errorCode}</strong>: {props.msg}
      </i>
    </ErrorMessage>
  );
};

export const KonvaModalContext = createContext({} as any);

export const ManualSelect = ({ eventObj }: any) => {
  const [docImageURL, setDocImageURL] = useState({} as any);
  const [currentLinesGeometry, setCurrentLinesGeometry] = useState([] as any);
  const [currentDocID, setCurrentDocID] = useState("" as any);
  const [currentSelection, setCurrentSelection] = useState({} as any);
  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);
  const [image] = useImage(docImageURL.url);
  const [filled, setFilled] = useState({} as any);
  const {
    setMainModalOpen,
    konvaModalOpen,
    setKonvaModalOpen,
    konvaModalDraggCoords,
    setKonvaModalDraggCoords,
    konvaModalDimensions,
    setKonvaModalDimensions,
    docImageDimensions,
    setDocImageDimensions,
  } = useContext(MainModalContext);
  const [errorFetchingImage, setErrorFetchingImage] = useState(false);
  const [errorFetchingGeometry, setErrorFetchingGeometry] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "unable to fetch resources from server. Try again later."
  );
  const [errorCode, setErrorCode] = useState(400);

  // modal
  const modalHandleClick = () => {
    if (
      currentDocID === "" ||
      currentDocID !== globalSelectedFile.get() ||
      errorFetchingImage ||
      errorFetchingGeometry
    ) {
      getImageAndGeometryFromServer(selectedDocData).then(() =>
        setKonvaModalOpen(true)
      );
    } else {
      setKonvaModalOpen(true);
    }
  };
  const id = konvaModalOpen ? "docit-manual-select-modal" : undefined;
  const isDocImageSet = Boolean(docImageURL.heightXWidthMutliplier);

  // geometry
  const docData = getKeyValuePairsByDoc();
  const selectedDocData = docData.filter(
    (doc) => doc.docID === globalSelectedFile.get()
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
        setMainModalOpen(false);
        eventObj.target.value = Object.keys(currentSelection)
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
      <CloseButton onClick={() => setMainModalOpen(false)}>
        <CloseIcon />
      </CloseButton>
      <DocName id="doc-name-typography" variant="h6">
        {selectedDocData.docName}
      </DocName>
      <ManualSelectButton
        label="Manual Select"
        variant="outlined"
        onClick={modalHandleClick}
      />

      {(errorFetchingGeometry || errorFetchingImage) && (
        <ErrorLine errorCode={errorCode} msg={errorMessage} />
      )}
      {!errorFetchingGeometry && !errorFetchingImage && isDocImageSet && (
        <Modal
          id={id}
          open={konvaModalOpen}
          onClose={() => setKonvaModalOpen(false)}
          aria-labelledby="manual-select-modal-title"
          aria-describedby="manual-select-modal-descripton"
          BackdropComponent={Backdrop}
          BackdropProps={{
            invisible: true,
          }}
          style={{ zIndex: 99999 }}
        >
          <Fade in={konvaModalOpen}>
            <WrappedJssComponent>
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
          </Fade>
        </Modal>
      )}
    </React.Fragment>
  );
};
