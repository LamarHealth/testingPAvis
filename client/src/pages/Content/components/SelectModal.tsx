import React, { useState, useRef } from "react";

import styled from "styled-components";

import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Collapse from "@material-ui/core/Collapse";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";

import { colors } from "../common/colors";
import {
  MAIN_MODAL_WIDTH,
  MODAL_SHADOW,
  DEFAULT_ERROR_MESSAGE,
} from "../common/constants";
import { KeyValuesWithDistance } from "./KeyValuePairs";
import {
  renderChiclets,
  RenderChicletsActionTypes,
} from "./ScoreChiclet/index";

import { TableComponent, TableContext } from "./KvpTable";
import { useStore, checkFileError, State } from "../contexts/ZustandStore";
import { DocumentInfo } from "../../../types/documents";

const ModalWrapper = styled.div`
  background-color: ${colors.DROPDOWN_TABLE_BACKGROUND};
  z-index: 9;
  max-height: 380px;
  overflow-x: scroll;
  overflow-y: scroll;
  width: ${MAIN_MODAL_WIDTH}px;
  border: 1px solid ${colors.MODAL_BORDER};
  box-shadow: ${MODAL_SHADOW};
`;

const StickyWrapper = styled.div`
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  padding-bottom: 10px;
  border-bottom: 1px solid ${colors.KVP_TABLE_BORDER};
`;

const CloseButton = styled(IconButton)`
  float: right;
`;

const DocName = styled(Typography)`
  padding: 10px 10px 0 10px;
`;

const TextInputContainer = styled.div`
  width: 100%;
  padding: 0 10px 10px 10px;
  box-sizing: border-box;
`;

const BigButton = styled(Chip)`
  font-weight: bold;
  padding: 0.3em 1.3em;
  margin: 0 10px;
`;

const ErrorMessage = styled(Typography)`
  margin: 1em;
`;

const Message = ({ msg }: any) => {
  return (
    <ErrorMessage>
      <i>{msg}</i>
    </ErrorMessage>
  );
};

const ErrorLine = () => {
  const [selectedFile, errorFiles] = [
    useStore((state: State) => state.selectedFile),
    useStore((state: State) => state.errorFiles),
  ];
  const errorMsg =
    selectedFile &&
    (errorFiles[selectedFile].errorMessage
      ? errorFiles[selectedFile].errorMessage
      : DEFAULT_ERROR_MESSAGE);

  return (
    <ErrorMessage>
      <i>
        <strong>Error</strong>: {errorMsg}
      </i>
    </ErrorMessage>
  );
};

type SelectModalProps = {
  document: DocumentInfo;
};

export const SelectModal = ({ document }: SelectModalProps) => {
  const [removeKVMessage, setRemoveKVMessage] = useState("" as string);
  const [messageCollapse, setMessageCollapse] = useState(false);
  const [
    selectedFile,
    targetString,
    eventTarget,
    setKonvaModalOpen,
    setSelectedChiclet,
    setKvpTableAnchorEl,
    errorFiles,
    setErrorFiles,
  ] = [
    useStore((state: State) => state.selectedFile),
    useStore((state: State) => state.targetString),
    useStore((state: State) => state.eventTarget),
    useStore((state: State) => state.setKonvaModalOpen),
    useStore((state: State) => state.setSelectedChiclet),
    useStore((state: State) => state.setKvpTableAnchorEl),
    useStore((state: State) => state.errorFiles),
    useStore((state: State) => state.setErrorFiles),
  ];

  const [unalteredKeyValue, setUnalteredKeyValue] = useState(
    null as KeyValuesWithDistance | null
  );
  const inputRef = useRef(null as HTMLInputElement | null);
  const errorGettingFile = checkFileError(errorFiles, selectedFile);

  const handleModalClose = () => {
    if (errorGettingFile) {
      // if there is an error, want to make sure that konva model is set to closed. otherwise, it will 'remain open' and the call to modalHandleClick won't go thru, cause it is useEffect, monitoring changes in konvaModalOpen
      setKonvaModalOpen(false);
      selectedFile // make sure selectedFile isn't null
        ? setErrorFiles({ [selectedFile]: { image: false, geometry: false } })
        : console.error("error: selectedFile null");
    }
    setKvpTableAnchorEl(null); // close modal
    setSelectedChiclet(null); // remove chiclet border
    //@ts-ignore
    inputRef.current && (inputRef.current.value = ""); // clear the text editor
  };

  const handleManualSelectButtonClick = () => {
    setKonvaModalOpen(true);
  };

  const handleSubmit = () => {
    if (inputRef.current && eventTarget) {
      const inputEl = inputRef.current as HTMLInputElement;
      eventTarget && (eventTarget.value = inputEl.value); // fill input w edited val
      setKvpTableAnchorEl(null); // close the modal
      setSelectedChiclet(null); // remove chiclet border

      // only render accuracy score if value was not edited.
      if (
        unalteredKeyValue !== null &&
        unalteredKeyValue.value === inputEl.value
      ) {
        renderChiclets(
          RenderChicletsActionTypes.value,
          eventTarget,
          unalteredKeyValue
        );
      } else {
        renderChiclets(RenderChicletsActionTypes.blank, eventTarget);
      }
      inputEl.value = ""; // clear the text editor
    } else {
      console.error("error: kvp table inputRef.current is null");
    }
  };

  return (
    <ModalWrapper>
      <StickyWrapper>
        <CloseButton onClick={handleModalClose}>
          <CloseIcon />
        </CloseButton>
        <DocName id="doc-name-typography" variant="subtitle1">
          {document.docName}
        </DocName>
        <TextInputContainer>
          <TextField
            variant="outlined"
            fullWidth
            placeholder={targetString}
            inputRef={inputRef}
            margin="dense"
            style={{ margin: 0 }}
          />
        </TextInputContainer>
        <BigButton
          label="Manual Select"
          variant="outlined"
          onClick={handleManualSelectButtonClick}
          style={{ backgroundColor: `${colors.MANUAL_SELECT_BUTTON_YELLOW}` }}
        />
        <BigButton
          label="Submit"
          variant="outlined"
          onClick={handleSubmit}
          style={{ backgroundColor: `${colors.FILL_BUTTON}`, color: "white" }}
        />
        {errorGettingFile && <ErrorLine />}
        <Collapse in={messageCollapse}>
          <Message msg={removeKVMessage} />
        </Collapse>
      </StickyWrapper>

      {document ? (
        <TableContext.Provider
          value={{
            document,
            setRemoveKVMessage,
            setMessageCollapse,
            setUnalteredKeyValue,
            inputRef,
          }}
        >
          <TableComponent document={document} />
        </TableContext.Provider>
      ) : (
        <Message
          msg={
            "The selected document doesn't have any key / value pairs. Try using Manual Select."
          }
        />
      )}
    </ModalWrapper>
  );
};
