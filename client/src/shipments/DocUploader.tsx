import React, { useState, useEffect } from "react";
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
  border-color: ${(props) => getColor(props)};
  border-style: dashed;
  background-color: hsla(140, 16%, 96%);
  color: gray;
  outline: none;
  transition: border 0.24s ease-in-out;
  transition: background-color 0.24s ease-in-out;
  text-align: center;
  justify-content: center;
  padding: 1em 0;
  :hover {
    background-color: hsl(196, 100%, 88%);
    color: rgb(1, 23, 47);
    border-color: rgb(1, 23, 47);
  }
  margin: 2em;

  & > p {
    padding: 1em;
  }
`;

export interface IFileWithPreview {
  file: File;
  preview: string;
}

export const StyledDropzone = () => {
  // Files can be declared as an object that we can later iterate over with object.entries()
  const [newFiles, setNewFiles] = useState([] as IFileWithPreview[]);

  // On Drop
  const onDrop = React.useCallback(
    (acceptedFiles: Array<File>) => {
      // Create dictionary containing file and preview
      const filesWithThumbnails = acceptedFiles.map((file: File) => {
        return {
          file,
          preview: URL.createObjectURL(file),
        };
      });

      setNewFiles(newFiles.concat(filesWithThumbnails));

      // endblock
    },
    [newFiles]
  );

  // onDragOver- Use this to make fancy animations with other components
  const onDragOver = React.useCallback((acceptedFiles: any) => {
    console.log("dragging");
  }, []);

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      newFiles.forEach((fileWithPreview: IFileWithPreview) =>
        URL.revokeObjectURL(fileWithPreview.preview)
      );
    },
    [newFiles]
  );

  // Dropzone Hook
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: ["application/pdf", "image/*"],
    onDrop,
    onDragOver,
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
      {!newFiles.length || <UploadingList files={newFiles} />}
    </>
  );
};
