import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
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
import { PAGE_SCALE, API_PATH } from "../common/constants";

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
  width: 100px;
  height: 100px;
  padding: 4px;
`;

const ThumbInner = styled.div`
  display: flex;
  minwidth: 0;
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

const updateLocalStorage = (documentInfo: any) => {
  const storedDocs = JSON.parse(localStorage.getItem("docList") || "[]");
  let updatedList = Array.isArray(storedDocs)
    ? storedDocs.filter((item: any) => {
        return typeof item === "object";
      })
    : [];
  updatedList.push(documentInfo);
  localStorage.setItem("docList", JSON.stringify(updatedList));
};

const FileStatus = (props: any) => {
  const [uploadStatus, setUploadStatus] = useState(Number);
  const countContext = useContext(CountContext);
  const fileInfoContext = useContext(FileContext);

  const currentFile = props.fileWithPreview.file;
  const [thumbnailSrc, setThumbnailSrc] = useState(
    props.fileWithPreview.preview
  );
  const index = props.fileWithPreview.index;

  // canvas reference so usePdf hook can select the canvas
  const canvasRef = useRef(null);

  const convertToImage = () => {
    URL.revokeObjectURL(thumbnailSrc); // revoke URL to avoid memory leak
    const insertionElement: any = document.querySelector("#insertion-point");
    const shadowRoot: any = insertionElement.children[0].shadowRoot;
    const canvas: any = shadowRoot.querySelector(`#pdf-canvas${index}`);
    const dataUrl = canvas.toDataURL();
    setThumbnailSrc(dataUrl);
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
  const uploadImageFile = async (file: File) => {
    // Increment load counter
    countContext.countDispatch("increment");

    const formData = new FormData();
    formData.append("myfile", file);
    try {
      const result = await fetch(`${API_PATH}/api/upload_status`, {
        method: "POST",
        body: formData,
      });
      // Status code cases
      switch (result.status) {
        case 200:
          // Add document info to list
          const postSuccessResponse: any = {
            type: "append",
            documentInfo: await result.json(),
          };
          updateLocalStorage(postSuccessResponse.documentInfo);
          fileInfoContext.fileDispatch(postSuccessResponse);
          setUploadStatus(200);
          break;
        case 405:
          setUploadStatus(405);
          window.alert("file size exceeds > 5mb, cannot use OCR.");
          break;
        case 429:
          setUploadStatus(429);
          break;
        default:
          setUploadStatus(result.status);
      }
    } catch {
      setUploadStatus(400);
    }

    // Decrement load counter
    countContext.countDispatch("decrement");
  };

  useEffect(() => {
    uploadImageFile(currentFile);
  }, []);

  return (
    <ThumbnailContainer key={index}>
      <ThumbInner>
        {!uploadStatus ? (
          <RefreshIcon />
        ) : uploadStatus === 200 ? (
          <SuccessIcon />
        ) : (
          <FailureIcon />
        )}
        <div id="thumbnail-wrapper">
          <Canvas id={`pdf-canvas${index}`} ref={canvasRef} />
          <Thumbnail
            id={`thumbnail${index}`}
            src={thumbnailSrc}
            blur={uploadStatus === 400}
          />
        </div>
      </ThumbInner>
    </ThumbnailContainer>
  );
};

export const UploadingList = (props: { files: Array<IFileWithPreview> }) => {
  const progressInitialState = props.files.length;
  const reducer = (state: number, action: string) => {
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
