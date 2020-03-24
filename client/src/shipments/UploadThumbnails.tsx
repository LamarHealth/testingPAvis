import React, {
  useState,
  useEffect,
  useReducer,
  createContext,
  useContext
} from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { Icon, ProgressBar, Popover, Position } from "@blueprintjs/core";
import { colors } from "../common/colors";
import { CountContext, FileInfoContext } from "./DocViewer";

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
  display: block;
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

export const UploadingList = (props: any) => {
  const [uploadsComplete, setUploadsComplete] = useState(false);

  const progressInitialState = props.thumbs.length;
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

  // useEffect(() => {
  //   let isOk = async () => {
  //     const result = await fetch("/api/upload_status", {
  //       method: "POST",
  //       headers: { "CONTENT-TYPE": "application/json" },
  //       body: JSON.stringify({ post: "FILEIDORSOMETHING" })
  //     });
  //     setUploadsComplete(result.ok);
  //   };
  //   isOk();
  // });

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
          {props.thumbs.map((file: any, ndx: number) => (
            <FileStatus key={ndx} file={file} onComplete={dispatch} />
          ))}
        </ThumbnailList>
      </UploadBufferContainer>
    </CountContext.Provider>
  );
};

const FileStatus = (props: any) => {
  const [fileStatus, setProcessStatus] = useState();
  const countContext = useContext(CountContext);
  const fileInfoContext = useContext(FileInfoContext);
  useEffect(() => {
    // Increment load counter
    countContext.countDispatch("increment");
    let isOk = async () => {
      const result = await fetch("/api/upload_status", {
        method: "POST",
        headers: { "CONTENT-TYPE": "application/json" },
        body: JSON.stringify({ post: "FILEIDORSOMETHING", docName: "plumbus" })
      });
      // Decrement laod counter
      countContext.countDispatch("decrement");

      // Add document info to list
      const docPayload: any = {
        type: "append",
        documentInfo: await result.json()
      };
      fileInfoContext.fileDispatch(docPayload);
      setProcessStatus(result.status);
    };
    isOk();
  }, []);

  return (
    <ThumbnailContainer key={props.ndx}>
      <ThumbInner>
        {!fileStatus ? (
          <RefreshIcon icon={"refresh"} />
        ) : fileStatus === 200 ? (
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
        <Thumbnail src={props.file.preview} blur={fileStatus === 400} />
      </ThumbInner>
    </ThumbnailContainer>
  );
};
