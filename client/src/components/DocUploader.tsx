import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import { colors } from "../common/colors";
import { UploadingList } from "./UploadThumbnails";
import Typography from "@material-ui/core/Typography";

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
  background-color: ${colors.WHITE};
  color: ${colors.DROPZONE_TEXT_GREY};
  outline: none;
  transition: border 0.24s ease-in-out;
  transition: background-color 0.24s ease-in-out;
  text-align: center;
  justify-content: center;
  padding: 1em 0;
  max-height: 11em;
  :hover {
    background: ${colors.DROPZONE_BACKGROUND_HOVER_LIGHTBLUE};
    color: ${colors.FONT_BLUE};
    border-color: ${colors.FONT_BLUE};
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
  let [index, setIndex] = useState(0);

  // On Drop
  const onDrop = React.useCallback(
    (acceptedFiles: Array<File>) => {
      // Create dictionary containing file and preview
      const filesWithThumbnails = acceptedFiles.map((file: File) => {
        const currentIndex = index;
        index++;
        setIndex(index);

        return {
          file,
          index: currentIndex,
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
        <Typography variant="body1">
          Drag and drop or click to select files
        </Typography>
        <CloudUploadIcon />
      </Container>
      {!newFiles.length || <UploadingList files={newFiles} />}
    </>
  );
};
