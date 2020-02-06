import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { Icon } from "@blueprintjs/core";
import { colors } from "../common/colors";

const getColor = (props: any) => {
  if (props.isDragAccept) {
    return "#00e676";
  }
  if (props.isDragReject) {
    return "#ff1744";
  }
  if (props.isDragActive) {
    return "#2196f3";
  }
  return "lightgray";
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: white;
  color: gray;
  outline: none;
  transition: border 0.24s ease-in-out;
  transition: background-color 0.24s ease-in-out;
  text-align: center;
  justify-content: center;
  padding: 1em 0;
  :hover {
    background-color: ${colors.LIGHTBLUE};
    color: white;
    border-color: white;
  }
`;

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

const UploadingList = (props: any) => {
  return (
    <UploadBufferContainer>
      <ThumbnailList>
        <h2>Uploading...</h2>
        {props.thumbs}
      </ThumbnailList>
    </UploadBufferContainer>
  );
};

export function StyledDropzone(props: any) {
  // Declare state
  const [newFileThumbnails, setNewFiles] = useState([]);

  // On Drop
  const onDrop = React.useCallback((acceptedFiles: any) => {
    console.log("DICKSHITTISTAN");
    setNewFiles(
      acceptedFiles.map((file: any) => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          uploadReceived:
            setTimeout(() => {
              return true;
            }, 4000) || false
        });
      })
    );
  }, []);

  const handleNewUpload = async (file: any) => {
    try {
      const response = await fetch("/api/timedpost", {
        method: "POST",
        headers: {},
        body: file
      });
      if (!response.ok) {
        throw new Error("Received improper response");
      }
      console.log("got response", response.ok);
      console.log("got response", response.json());
      return response.ok;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // TODO: Check user ID
    // TODO: Update list of files based on what's in storage
    fetch("/api/timedpost", {
      method: "GET",
      headers: { "CONTENT-TYPE": "application/json" }
    }).then(({ response }: any) => {});
  });

  // onDragOver- Use this to make fancy animations with other components
  const onDragOver = React.useCallback((acceptedFiles: any) => {
    console.log("dragging");
  }, []);

  const thumbs = newFileThumbnails.map((file: any) => (
    <ThumbnailContainer>
      <ThumbInner>
        {!file.uploadReceived ? (
          <RefreshIcon icon={"refresh"} />
        ) : (
          <SuccessIcon icon={"small-tick"} iconSize={30} />
        )}
        <Thumbnail src={file.preview} />
      </ThumbInner>
    </ThumbnailContainer>
  ));

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      newFileThumbnails.forEach((file: any) =>
        URL.revokeObjectURL(file.preview)
      );
    },
    [newFileThumbnails]
  );

  // Dropzone Hook
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    accept: ["application/pdf", "image/*"],
    onDrop,
    onDragOver
  });

  return (
    <>
      <Container
        {...getRootProps({ isDragActive, isDragAccept, isDragReject })}
      >
        <input {...getInputProps()} />
        <p>Drag and drop or click to select files</p>
        <Icon icon={"cloud-upload"} iconSize={25} />
      </Container>
      {thumbs.length === 0 || <UploadingList thumbs={thumbs} />}
    </>
  );
}
