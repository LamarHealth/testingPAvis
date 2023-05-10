/* global chrome */
import React, {
  useState,
  useEffect,
  createContext,
  useReducer,
  useCallback,
} from "react";

import useImage from "use-image";

import {
  renderChiclets,
  RenderChicletsActionTypes,
} from "./ScoreChiclet/index";
import { KeyValuesByDoc } from "./KeyValuePairs";
import {
  useStore,
  checkFileError,
  Uuid,
  State,
} from "../contexts/ZustandStore";
import { RndComponent } from "./KonvaRndDraggable";
import WrappedJssComponent from "./ShadowComponent";

import { v4 as uuidv4 } from "uuid";
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

export interface DocImageDimensions {
  width: number;
  height: number;
}

export interface LinesSelection {
  [lineID: string]: string | undefined;
}

interface RequestWithError {
  error?: string;
}

export enum LinesSelectionActionTypes {
  select,
  deselect,
  reset,
}

export enum InputValActionTypes {
  replace,
  appendLine,
  removeLine,
  reset,
}

interface LinesSelectionReducerAction {
  type: LinesSelectionActionTypes;
  line?: LinesSelection;
}

interface InputValAction {
  type: InputValActionTypes;
  value?: string;
}

interface ManualSelectNewTabProps {
  isInNewTab?: boolean;
  konvaModalOpen?: boolean;
  selectedFile?: string;
  docData?: KeyValuesByDoc[];
}

interface KanvaModalContextProps {
  image: CanvasImageSource | undefined;
  currentLinesGeometry: LinesGeometry[];
  docImageDimensions: DocImageDimensions;
  linesSelection: LinesSelection;
  inputVal: string;
  docImageURL: DocImageURL;
  errorLine: string | null;
  linesSelectionDispatch: React.Dispatch<LinesSelectionReducerAction>;
  inputValDispatch: React.Dispatch<InputValAction>;
  handleSubmitAndClear: () => void;
  handleClear: () => void;
  setDocImageDimensions: React.Dispatch<
    React.SetStateAction<DocImageDimensions>
  >;
  setErrorLine: React.Dispatch<React.SetStateAction<string | null>>;
}

export const KonvaModalContext = createContext({} as KanvaModalContextProps);

const linesSelectionReducer = (
  state: LinesSelection,
  action: LinesSelectionReducerAction
) => {
  switch (action.type) {
    case LinesSelectionActionTypes.select:
      return { ...state, ...action.line };
    case LinesSelectionActionTypes.deselect:
      action.line && delete state[Object.keys(action.line)[0]];
      return { ...state };
    case LinesSelectionActionTypes.reset:
      return {};
    default:
      console.error("linesSelectionReducer action type is wrong");
      return {};
  }
};

const inputValReducer = (state: string, action: InputValAction) => {
  switch (action.type) {
    case InputValActionTypes.replace:
      if (action.value) {
        return action.value;
      } else
        console.error(
          "inputValReducer called without a valid string replace value"
        );
      break;
    case InputValActionTypes.appendLine:
      const prevInputValArray = Array.from(state);
      // if ends in space, don't add another
      if (prevInputValArray[prevInputValArray.length - 1] === " ") {
        return state + action.value;
      } else {
        return state + " " + action.value;
      }
    case InputValActionTypes.removeLine:
      if (action.value) {
        return state.replace(action.value, "");
      } else {
        console.error("inputValReducer called without a value to remove");
        break;
      }
    case InputValActionTypes.reset:
      return "";
    default:
      console.error("inputValReducer action type is wrong");
      break;
  }
  return "";
};

export const ManualSelect = (props: ManualSelectNewTabProps) => {
  const [docImageDimensions, setDocImageDimensions] = useState({
    width: 0,
    height: 0,
  } as DocImageDimensions);
  const [
    eventTarget,
    selectedFileFromStore,
    docDataFromStore,
    konvaModalOpenFromStore,
    setKvpTableAnchorEl,
    autocompleteAnchor,
    errorFiles,
    setErrorFiles,
  ] = [
    useStore((state: State) => state.eventTarget),
    useStore((state: State) => state.selectedFile),
    useStore((state: State) => state.docData),
    useStore((state: State) => state.konvaModalOpen),
    useStore((state: State) => state.setKvpTableAnchorEl),
    useStore((state: State) => state.autocompleteAnchor),
    useStore((state: State) => state.errorFiles),
    useStore((state: State) => state.setErrorFiles),
  ];
  // if in new tab, no access to same zustand store, so use props instead
  const konvaModalOpen = props.isInNewTab
    ? props.konvaModalOpen
    : konvaModalOpenFromStore;
  const selectedFile = (
    props.isInNewTab ? props.selectedFile : selectedFileFromStore
  ) as Uuid;
  const docData = (
    props.isInNewTab ? props.docData : docDataFromStore
  ) as KeyValuesByDoc[];
  const [docImageURL, setDocImageURL] = useState({} as DocImageURL);
  const [currentLinesGeometry, setCurrentLinesGeometry] = useState(
    [] as LinesGeometry[]
  );
  const [currentDocID, setCurrentDocID] = useState(
    undefined as string | undefined
  );
  const [image] = useImage(docImageURL.url);
  const [errorLine, setErrorLine] = useState(null as null | string);
  const errorGettingFile = checkFileError(errorFiles, selectedFile);
  const [linesSelection, linesSelectionDispatch] = useReducer(
    linesSelectionReducer,
    {} as LinesSelection
  );
  const [inputVal, inputValDispatch] = useReducer(
    inputValReducer,
    "" as string
  );

  // modal open
  const modalHandleClick = () => {
    if (
      konvaModalOpen === true &&
      (currentDocID === null ||
        currentDocID !== selectedFile ||
        errorGettingFile)
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

  // TODO: Update this code so it fetches when we select the document in general, not just when we use manual select
  const getImageAndGeometryFromServer = async (doc: KeyValuesByDoc) => {
    const docName = doc.docName;
    const docID = doc.docID;
    doc.docType = doc.docType === "pdf" ? "png" : doc.docType;
    const docType = doc.docType;
    setCurrentDocID(docID);

    // get image
    const docImageResponse: Response = await fetch(
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
    const linesGeometryResponse = await fetch(
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
        ).linesGeometry.map((lineGeometry: LinesGeometry[]) => {
          //@ts-ignore
          return { ...lineGeometry, ID: uuidv4() };
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

  // listen for message coming back from RenderModal / background.js, saying that eventTarget is falsy
  useEffect(() => {
    if (props.isInNewTab) {
      const callback = function (request: RequestWithError) {
        if (request.error) {
          setErrorLine("Please select a text input to fill");
        }
      };
      chrome.runtime.onMessage.addListener(callback);
      return () => chrome.runtime.onMessage.removeListener(callback);
    }
  }, [setErrorLine, props.isInNewTab]);

  // submit button / enter
  const cleanupAfterSubmit = useCallback(() => {
    setErrorLine(null);
    linesSelectionDispatch({ type: LinesSelectionActionTypes.reset });
    inputValDispatch({ type: InputValActionTypes.reset });
  }, [setErrorLine, linesSelectionDispatch, inputValDispatch]);

  const handleSubmitAndClear = useCallback(() => {
    // useCallback because we have to use in useEffect below, and React will ping with warning if handleSubmitAndClear not wrapped in useCallback
    if (props.isInNewTab) {
      chrome.runtime.sendMessage({
        fillValue: inputVal,
      });
      cleanupAfterSubmit();
    } else {
      if (eventTarget) {
        if (inputVal !== "") {
          renderChiclets(RenderChicletsActionTypes.blank, eventTarget);
          eventTarget.value = inputVal;
          cleanupAfterSubmit();
        } else {
          setErrorLine("Nothing to enter");
        }
      } else {
        setErrorLine("Please select a text input to fill");
      }
    }
  }, [
    eventTarget,
    inputVal,
    setErrorLine,
    cleanupAfterSubmit,
    props.isInNewTab,
  ]);

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
  }, [autocompleteAnchor, handleSubmitAndClear]);

  // clear button
  const handleClear = () => {
    cleanupAfterSubmit();
  };

  // clear entries on doc switch
  useEffect(() => {
    cleanupAfterSubmit();
  }, [cleanupAfterSubmit]);

  return (
    <React.Fragment>
      {!errorGettingFile && isDocImageSet && (
        <WrappedJssComponent wrapperClassName={"shadow-root-for-modals"}>
          <KonvaModalContext.Provider
            value={{
              image,
              currentLinesGeometry,
              docImageDimensions,
              setDocImageDimensions,
              docImageURL,
              errorLine,
              setErrorLine,
              handleSubmitAndClear,
              handleClear,
              linesSelection,
              linesSelectionDispatch,
              inputVal,
              inputValDispatch,
            }}
          >
            <RndComponent>
              <></>
            </RndComponent>
          </KonvaModalContext.Provider>
        </WrappedJssComponent>
      )}
    </React.Fragment>
  );
};
