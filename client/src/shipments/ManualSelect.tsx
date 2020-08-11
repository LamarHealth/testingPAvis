import React, { useState, useEffect, createContext, useContext } from "react";

import { useState as useSpecialHookState } from "@hookstate/core";
import useImage from "use-image";
import styled from "styled-components";
import Draggable, { DraggableData } from "react-draggable";

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
import { API_PATH } from "../common/constants";
import { DOC_IMAGE_WIDTH } from "../common/constants";
import { KONVA_MODAL_MAX_HEIGHT } from "../common/constants";

const ModalWrapper = styled.div`
  top: 25px;
  position: absolute;
  max-height: ${KONVA_MODAL_MAX_HEIGHT}px;
  overflow-y: scroll;
  border: 1px solid ${colors.MODAL_BORDER};
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
    manualSelectModalOpen,
    setManualSelectModalOpen,
  } = useContext(MainModalContext);
  const [errorFetchingImage, setErrorFetchingImage] = useState(false);
  const [errorFetchingGeometry, setErrorFetchingGeometry] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "unable to fetch resources from server. Try again later."
  );
  const [errorCode, setErrorCode] = useState(400);
  const [draggableCoords, setDraggableCoords] = useState({
    x: 0,
    y: 0,
  });

  // modal
  const modalHandleClick = () => {
    if (
      currentDocID === "" ||
      currentDocID !== globalSelectedFile.get() ||
      errorFetchingImage ||
      errorFetchingGeometry
    ) {
      getImageAndGeometryFromServer(selectedDocData).then(() =>
        setManualSelectModalOpen(true)
      );
    } else {
      setManualSelectModalOpen(true);
    }
  };
  const id = manualSelectModalOpen ? "docit-manual-select-modal" : undefined;
  const isDocImageSet = Boolean(docImageURL.overlayPositionOffset);

  // geometry
  const docData = getKeyValuePairsByDoc();
  const selectedDocData = docData.filter(
    (doc) => doc.docID === globalSelectedFile.get()
  )[0];

  const getImageAndGeometryFromServer = async (doc: KeyValuesByDoc) => {
    const docName = doc.docName;
    const docType = doc.docType;
    const docID = doc.docID;

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
          let urlObj: any = {
            url: objectURL,
            height: (DOC_IMAGE_WIDTH * this.naturalHeight) / this.naturalWidth,
            overlayPositionOffset: (window.innerWidth - DOC_IMAGE_WIDTH) / 2,
          };
          setDocImageURL(urlObj);
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
        setManualSelectModalOpen(false);
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

  return (
    <React.Fragment>
      <Typography variant="h6" style={{ margin: "1em" }}>
        {selectedDocData.docName}
      </Typography>
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
          open={manualSelectModalOpen}
          onClose={() => setManualSelectModalOpen(false)}
          aria-labelledby="manual-select-modal-title"
          aria-describedby="manual-select-modal-descripton"
          BackdropComponent={Backdrop}
          BackdropProps={{
            invisible: true,
          }}
          style={{ zIndex: 99999 }}
        >
          <Fade in={manualSelectModalOpen}>
            <Draggable
              position={{ x: draggableCoords.x, y: draggableCoords.y }}
              onStop={(e: any, data: DraggableData) =>
                setDraggableCoords({ x: data.x, y: data.y })
              }
            >
              <div>
                <WrappedJssComponent>
                  <ModalWrapper
                    style={{
                      left: `${docImageURL.overlayPositionOffset}px`,
                    }}
                  >
                    <KonvaModalContext.Provider
                      value={{
                        docImageURL,
                        currentSelection,
                        image,
                        filled,
                        setFilled,
                        setCurrentSelection,
                        currentLinesGeometry,
                        setManualSelectModalOpen,
                      }}
                    >
                      <KonvaModal />
                    </KonvaModalContext.Provider>
                  </ModalWrapper>
                </WrappedJssComponent>
              </div>
            </Draggable>
          </Fade>
        </Modal>
      )}
    </React.Fragment>
  );
};
