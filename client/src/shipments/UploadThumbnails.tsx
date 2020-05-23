import React, { useState, useEffect, useReducer, useContext } from "react";
import styled from "styled-components";
import { Icon, ProgressBar, Popover, Position } from "@blueprintjs/core";
import { CountContext, FileContext } from "./DocViewer";
import { IFileWithPreview } from "./DocUploader";

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

const Thumbnail = styled.img`
  position: relative;
  display: block;
  width: auto;
  height: 100%;
  filter: ${(props: { blur: boolean }) => (props.blur ? "blur(8px)" : 0)};
`;

const ThumbnailIcon = styled(Icon)`
  position: absolute;
  height: 16px;
  width: 16px;
  margin: 2px;
  display: inline-block;
  z-index: 3;
`;

const SuccessIcon = styled(ThumbnailIcon)`
  color: green;
`;

const FailureIcon = styled(ThumbnailIcon)`
  color: red;
`;

const RefreshIcon = styled(ThumbnailIcon)`
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
          <h3>
            {count === 0 ? (
              "Files Uploaded"
            ) : (
              <ProgressBar intent={"primary"} />
            )}
          </h3>
          {props.files.map((fileWithPreview: IFileWithPreview, ndx: number) => (
            <FileStatus
              key={ndx}
              fileWithPreview={fileWithPreview}
              onComplete={dispatch}
            />
          ))}
        </ThumbnailList>
      </UploadBufferContainer>
    </CountContext.Provider>
  );
};

const FileStatus = (props: any) => {
  const [uploadStatus, setUploadStatus] = useState(Number);
  const countContext = useContext(CountContext);
  const fileInfoContext = useContext(FileContext);
  useEffect(() => {
    // Increment load counter
    countContext.countDispatch("increment");

    // Upload file to backend
    console.log(props.fileWithPreview);
    const formData = new FormData();
    formData.append("myfile", props.fileWithPreview.file);
    const uploadFile = async () => {
      try {
        const result = await fetch("/api/upload_status", {
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
            break;
          case 400:
          default:
            setUploadStatus(400);
        }

        setUploadStatus(result.status);
      } catch {
        setUploadStatus(400);
      }

      // Decrement load counter
      countContext.countDispatch("decrement");
    };
    uploadFile();
    // TODO: Set default to be pre-loaded documents
  }, []);

  return (
    <ThumbnailContainer key={props.ndx}>
      <ThumbInner>
        {!uploadStatus ? (
          <RefreshIcon icon={"refresh"} />
        ) : uploadStatus === 200 ? (
          <SuccessIcon icon={"small-tick"} iconSize={30} />
        ) : (
          <Popover
            interactionKind={"hover"}
            position={Position.TOP}
            content={<div>Unable to process document</div>}
          >
            <FailureIcon icon={"cross"} iconSize={30} />
          </Popover>
        )}
        <Thumbnail
          src={props.fileWithPreview.preview}
          blur={uploadStatus === 400}
        />
      </ThumbInner>
    </ThumbnailContainer>
  );
};
