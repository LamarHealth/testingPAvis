import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useReducer,
} from "react";

import useImage from "use-image";

import { KeyValuesByDoc } from "./KeyValuePairs";
import { useStore, findErrorGettingFile } from "../contexts/ZustandStore";
import { MainModalContext } from "./RenderModal";
import { RndComponent } from "./KonvaRndDraggable";
import WrappedJssComponent from "./ShadowComponent";
import { renderAccuracyScore } from "./AccuracyScoreCircle";

import uuidv from "uuid";
import { API_PATH, DOC_IMAGE_WIDTH } from "../common/constants";

export interface LinesGeometry {
  Coordinates: { X: number; Y: number }[];
  ID: string;
  Text: string;
}

interface DocImageURL {
  heightXWidthMultiplier: number;
  url: string;
}

export interface LinesSelection {
  [lineID: string]: string;
}

export interface LinesSelectionReducerAction {
  type: "select" | "deselect" | "reset";
  line?: LinesSelection;
}

export const KonvaModalContext = createContext({} as any);

function linesSelectionReducer(
  state: LinesSelection,
  action: LinesSelectionReducerAction
) {
  switch (action.type) {
    case "select":
      return { ...state, ...action.line };
    case "deselect":
      action.line && delete state[Object.keys(action.line)[0]];
      return { ...state };
    case "reset":
      return {};
    default:
      throw new Error();
  }
}

export const ManualSelect = () => {
  const { docImageDimensions, setDocImageDimensions } = useContext(
    MainModalContext
  );
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
  const [linesSelection, linesSelectionDispatch] = useReducer(
    linesSelectionReducer,
    {} as LinesSelection
  );
  const [image] = useImage(docImageURL.url);
  const [errorLine, setErrorLine] = useState(null as null | string);
  const errorGettingFile = findErrorGettingFile(errorFiles, selectedFile);
  const [inputVal, setInputVal] = useState("" as string);

  // modal open
  const modalHandleClick = () => {
    if (
      konvaModalOpen === true &&
      (currentDocID === "" || currentDocID !== selectedFile || errorGettingFile)
    ) {
      getImageAndGeometryFromServer(selectedDocData);
    }
  };
  useEffect(modalHandleClick, [konvaModalOpen, selectedFile]);
  const isDocImageSet = Boolean(docImageURL.heightXWidthMultiplier);
  !errorGettingFile && isDocImageSet && setKvpTableAnchorEl(null); // important... close kvp table only when konva modal is displayed

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
              return {
                width: DOC_IMAGE_WIDTH,
                height: DOC_IMAGE_WIDTH * heightXWidthMultiplier,
              };
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
      if (inputVal !== "") {
        renderAccuracyScore("blank", eventTarget);
        eventTarget.value = inputVal;
        setErrorLine(null);
        linesSelectionDispatch({ type: "reset" });
        setInputVal("");
      } else {
        setErrorLine("Nothing to enter");
      }
    } else {
      setErrorLine("Please select a text input to fill");
    }
  };

  // return key listener
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
  }, [inputVal, eventTarget, autocompleteAnchor]);

  // clear button
  const handleClear = () => {
    linesSelectionDispatch({ type: "reset" });
    setInputVal("");
  };

  // clear entries on doc switch
  useEffect(() => {
    linesSelectionDispatch({ type: "reset" });
    setInputVal("");
  }, [selectedFile]);

  return (
    <React.Fragment>
      {!errorGettingFile && isDocImageSet && (
        <WrappedJssComponent wrapperClassName={"shadow-root-for-modals"}>
          <KonvaModalContext.Provider
            value={{
              image,
              inputVal,
              setInputVal,
              currentLinesGeometry,
              docImageDimensions,
              docImageURL,
              errorLine,
              setErrorLine,
              handleSubmitAndClear,
              handleClear,
              linesSelection,
              linesSelectionDispatch,
            }}
          >
            <RndComponent />
          </KonvaModalContext.Provider>
        </WrappedJssComponent>
      )}
    </React.Fragment>
  );
};
