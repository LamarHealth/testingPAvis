import React, {
  Dispatch,
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
  useCallback,
} from "react";
import styled from "styled-components";
import Clear from "@material-ui/icons/Clear";
import CheckIcon from "@material-ui/icons/Check";
import LoopIcon from "@material-ui/icons/Loop";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";

import { CountContext, FileContext } from "./DocViewer";
import { IFileWithPreview } from "./DocUploader";
import { usePdf } from "@mikecousins/react-pdf";
import { PAGE_SCALE } from "../common/constants";
import { useStore, State } from "../contexts/ZustandStore";
import { getKeyValuePairsByDoc } from "./KeyValuePairs";
import { addThumbsLocalStorage } from "./docThumbnails";

import { DocumentInfo, StatusCodes } from "../../../types/documents";
import { OCRMessageResponse } from "../../../types/documents";

import { blobToBase64 } from "../../../utils/functions";
import { addDocToLocalStorage } from "./docList";

const UploadBufferContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-width: 2px;
  border-radius: 2px;
  background-color: white;
  color: gray;
  outline: none;
  transition: border 0.24s ease-in-out;
  transition: background-color 0.24s ease-in-out;
  text-align: center;
  justify-content: center;
  padding: 1em 0;
`;

const ThumbnailList = styled.div`
  display: table-column;
  width: 100;
  height: 100;
`;

const ThumbnailContainer = styled.div`
  background-color: white;
  display: inline-flex;
  border-radius: 2;
  border: 1px solid #eaeaea;
  margin: 8px;
  width: 80px;
  height: 80px;
  padding: 4px;
`;

const ThumbInner = styled.div`
  display: flex;
  min-width: 0;
  overflow: hidden;
  position: relative;
`;

// canvas element for PDFJS
const Canvas = styled.canvas`
  position: relative;
  display: none;
`;

const Thumbnail = styled.img`
  position: relative;
  display: block;
  width: auto;
  height: 100%;
  filter: ${(props: { blur: boolean }) => (props.blur ? "blur(8px)" : 0)};
`;

const SuccessIcon = styled(CheckIcon)`
  color: green;
`;

const FailureIcon = styled(Clear)`
  color: red;
`;

const RefreshIcon = styled(LoopIcon)`
  animation: spin 3s linear infinite;
  @keyframes spin {
    from {
      transform: rotate(0deg);
      transform-origin: center center;
    }
    to {
      transform: rotate(360deg);
      transform-origin: center center;
    }
  }
`;

interface FileStatusProps {
  fileWithPreview: IFileWithPreview;
  onComplete: Dispatch<Action>;
}

const FileStatus = (props: FileStatusProps) => {
  const currentFile = props.fileWithPreview.file;
  const currentFilePreview = props.fileWithPreview.preview;
  const index = props.fileWithPreview.index;
  const [setDocData] = [useStore((state: State) => state.setDocData)];
  const { countDispatch } = useContext(CountContext);
  const { setFileList } = useContext(FileContext);
  const [uploadStatus, setUploadStatus] = useState(Number);
  const [thumbnailSrc, setThumbnailSrc] = useState(
    props.fileWithPreview.preview
  );
  const [docID, setDocID] = useState(undefined as string | undefined);

  // canvas reference so usePdf hook can select the canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const convertToImage = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas ? canvas.toDataURL() : "";
    setThumbnailSrc(dataURL);
  };

  // the PDFJS usePdf hook
  usePdf({
    file: thumbnailSrc, // set the file source of the hook to the URL passed through the props
    page: 1,
    canvasRef,
    scale: PAGE_SCALE,
    onPageRenderSuccess: convertToImage,
  });

  // upload file
  const uploadImageFile = useCallback(
    (file: File) => {
      // 1. Increment load counter
      countDispatch("increment");
      // 2. Convert the Blob to Base64
      blobToBase64(file)
        .then((base64Data) => {
          // 3. Send message to the background script with the PDF data (Base64)
          chrome.runtime.sendMessage(
            { message: "fileUploaded", data: base64Data, fileName: file.name },
            (response: OCRMessageResponse) => {
              // Handle response from the background script
              console.log("Response from background script:", response);

              switch (response.status) {
                case StatusCodes.SUCCESS:
                  // Create full document info
                  const documentInfo: DocumentInfo = {
                    docID: response.documentInfo.docID,
                    keyValuePairs: response.documentInfo.keyValuePairs,
                    lines: response.documentInfo.lines,
                    docName: file.name,
                    docType: file.type,
                  };

                  addDocToLocalStorage(documentInfo).then((updatedList) => {
                    // update loc store
                    // set fileList
                    setFileList(updatedList);

                    // set the global var to reflect that
                    getKeyValuePairsByDoc().then((keyValuePairsByDoc) =>
                      setDocData(keyValuePairsByDoc)
                    );
                  });
                  setDocID(response.documentInfo.docID);
                  setUploadStatus(StatusCodes.SUCCESS);
                  break;
                case StatusCodes.FAILURE:
                  setUploadStatus(StatusCodes.FAILURE);
                  break;
                default:
                  setUploadStatus(StatusCodes.FAILURE);
                  break;
              }
            }
          );
        })
        .catch((error) => {
          console.log("Error:", error);
          setUploadStatus(StatusCodes.FAILURE);
        })
        .finally(() => {
          // 4. Decrement load counter
          countDispatch("decrement");
        });
    },
    [setDocData, setUploadStatus, countDispatch, setFileList]
  );

  useEffect(() => {
    uploadImageFile(currentFile);
  }, [uploadImageFile, currentFile]);

  useEffect(() => {
    const fileType = props.fileWithPreview.file.type;
    if (
      fileType === "application/pdf" &&
      docID &&
      thumbnailSrc.startsWith("data:image/png;base64,")
    ) {
      addThumbsLocalStorage(docID, thumbnailSrc);
    }
  }, [thumbnailSrc, docID, props.fileWithPreview.file.type]);

  return (
    <ThumbnailContainer key={index}>
      <ThumbInner>
        {!uploadStatus ? (
          <RefreshIcon />
        ) : uploadStatus === StatusCodes.SUCCESS ? (
          <SuccessIcon />
        ) : (
          <FailureIcon />
        )}
        <div id="thumbnail-wrapper">
          <Canvas id={`pdf-canvas${index}`} ref={canvasRef} />
          <Thumbnail
            id={`thumbnail${index}`}
            src={thumbnailSrc}
            blur={uploadStatus === StatusCodes.FAILURE}
          />
        </div>
      </ThumbInner>
    </ThumbnailContainer>
  );
};

type Action = "decrement" | "increment" | "reset";

export const UploadingList = (props: { files: Array<IFileWithPreview> }) => {
  const progressInitialState = props.files.length;
  const reducer = (state: number, action: Action): number => {
    switch (action) {
      case "decrement":
        return state - 1;
      case "increment":
        return state + 1;
      case "reset":
        return progressInitialState;
      default:
        return state;
    }
  };

  const [count, dispatch] = useReducer(reducer, 0);

  return (
    <CountContext.Provider
      value={{ countState: count, countDispatch: dispatch }}
    >
      <UploadBufferContainer>
        <ThumbnailList>
          <Typography>
            {count === 0 ? "Files Uploaded" : <LinearProgress />}
          </Typography>
          {props.files.map((fileWithPreview: IFileWithPreview, ndx: number) => {
            return (
              <FileStatus
                key={ndx}
                fileWithPreview={fileWithPreview}
                onComplete={dispatch}
              />
            );
          })}
        </ThumbnailList>
      </UploadBufferContainer>
    </CountContext.Provider>
  );
};
