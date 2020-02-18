import React, { useState, useEffect, useReducer } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { Icon } from "@blueprintjs/core";
import { colors } from "../common/colors";
import { UploadingList } from "./UploadThumbnails";

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

export function StyledDropzone(props: any) {
  // Declare state
  // Files can be declared as an object that we can later iterate over with object.entries()
  const [newFileThumbnails, setNewFiles] = useState([]);

  // On Drop
  const onDrop = React.useCallback(
    (acceptedFiles: any) => {
      // Assign new properties to files
      let droppedFiles = acceptedFiles.map((file: any) => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          uploadReceived: true
        });
      });

      setNewFiles(newFileThumbnails.concat(droppedFiles));

      // endblock
    },
    [newFileThumbnails]
  );

  // onDragOver- Use this to make fancy animations with other components
  const onDragOver = React.useCallback((acceptedFiles: any) => {
    console.log("dragging");
  }, []);

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
      {newFileThumbnails.length === 0 || (
        <UploadingList thumbs={newFileThumbnails} />
      )}
    </>
  );
}
