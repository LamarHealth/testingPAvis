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
import { constants } from "../common/constants";

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
  display: block;
  width: auto;
  height: 100%;
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

  // upload file function
  const uploadImageFile = async (file: File) => {
    // Increment load counter
    countContext.countDispatch("increment");

    const formData = new FormData();
    formData.append("myfile", file);
    try {
      const result = await fetch(
        `${process.env.REACT_APP_API_PATH}/api/upload_status`,
        {
          method: "POST",
          body: formData,
        }
      );
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

  // canvas reference so usePdf hook can select the canvas
  const canvasRef = useRef(null);

  // function assigned to onDocumentLoadSuccess, called after pdf is loaded. Note that this will only fire if the URL passed through the props points to a pdf; if it points to an image, the usePdf hook will fail and onDocumentLoadFail will fire instead (here left undefined)
  const convertToImage = () => {
    URL.revokeObjectURL(thumbnailSrc); // revoke URL to avoid memory leak
    const insertionElement: any = document.querySelector("#insertion-point");
    const shadowRoot: any = insertionElement.children[0].children[0].shadowRoot;
    const canvas: any = shadowRoot.querySelector(`#pdf-canvas${index}`);
    const dataUrl = canvas.toDataURL();
    setThumbnailSrc(dataUrl);

    // after thumbnail, convert to File and upload to server (using the following method: https://stackoverflow.com/questions/49925039/create-a-file-object-from-an-img-tag)
    const base64 = dataUrl.split(",")[1];
    const mime = dataUrl.split(",")[0].match(/:(.*?);/)[1];
    const bin = atob(base64);
    const length = bin.length;
    const buf = new ArrayBuffer(length);
    const arr = new Uint8Array(buf);
    bin.split("").forEach((e, i) => (arr[i] = e.charCodeAt(0)));

    const imageFileFromPdf = new File([buf], currentFile.name, {
      type: mime,
    });

    //upload, and handle errors
    if (imageFileFromPdf.type.includes("image/")) {
      uploadImageFile(imageFileFromPdf);
    }
  };

  // the PDFJS usePdf hook
  usePdf({
    file: thumbnailSrc, // set the file source of the hook to the URL passed through the props
    page: 1,
    canvasRef,
    scale: constants.PAGE_SCALE,
    onPageRenderSuccess: convertToImage,
  });

  useEffect(() => {
    // only upload image files, pdfs are handled above
    if (currentFile.type.includes("image/png")) {
      uploadImageFile(currentFile);
    }

    // TODO: Set default to be pre-loaded documents
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
