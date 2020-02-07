import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { Icon } from "@blueprintjs/core";
import { colors } from "../common/colors";

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

export const UploadingList = (thumbs: any) => {
  return (
    <UploadBufferContainer>
      <ThumbnailList>
        <h2>Uploading...</h2>
        {UploadThumbnails(thumbs)}
      </ThumbnailList>
    </UploadBufferContainer>
  );
};

const UploadThumbnails = (thumbs: any) => {
  return thumbs.map((file: any, ndx: number) => (
    <ThumbnailContainer key={ndx}>
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
};
