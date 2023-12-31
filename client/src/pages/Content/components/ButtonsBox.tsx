import React, { useState, useContext, memo, MouseEvent } from "react";

import styled from "styled-components";
import {
  useStore,
  State,
  useSelectedDocumentStore,
  SelectedDocumentStoreState,
} from "../contexts/ZustandStore";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";

import { FileContext, IsSelected } from "./DocViewer";
import { deleteThumbsLocalStorage } from "./docThumbnails";
import { getKeyValuePairsByDoc } from "./KeyValuePairs";
import {
  populateForms,
  PopulateFormsActionTypes,
} from "./ScoreChiclet/functions";
import { colors, colorSwitcher } from "../common/colors";
import { DOC_CARD_HEIGHT, LOCAL_MODE } from "../common/constants";
import { DocumentInfo, KeyValuePairs } from "../../../types/documents";
import { deleteDocFromLocalStorage } from "./docList";

const ButtonsBoxWrapper = styled.div`
  height: ${DOC_CARD_HEIGHT};
  width: 100%;
  display: ${(props: { hovering: boolean }) =>
    props.hovering ? "inherit" : "none"};
  flex-grow: 100;
`;

const CollapseInnerWrapper = styled.div`
  height: ${DOC_CARD_HEIGHT};
  width: 100%;
`;

const ButtonsFlexContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  box-sizing: border-box;
  padding: 0 0.5em;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`;

const FlexIconButton = styled(IconButton)`
  flex-basis: auto;
  flex-grow: 1;
  padding: 0;
  min-height: 2em;
  max-height: 2em;
  min-width: 2em;
  max-width: 2em;
`;

const StyledChip = styled(Chip)`
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")};
  ${(props: IsSelected) =>
    colorSwitcher(
      props.isSelected,
      "border",
      "1px solid",
      `${colors.DROPZONE_TEXT_LIGHTGREY}`,
      `${colors.DOC_CARD_BORDER}`
    )};
`;

const StyledATag = styled.a`
  text-decoration: none;
`;

const StyledDeleteIcon = styled(DeleteIcon)`
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")};
`;

const StyledGetAppIcon = styled(GetAppIcon)`
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")};
`;

const DeleteConfirm = (props: { docInfo: DocumentInfo }) => {
  const { setFileList } = useContext(FileContext);
  const [setSelectedFile, setDocData] = [
    useStore((state: State) => state.setSelectedFile),
    useStore((state: State) => state.setDocData),
  ];

  const [selectedDocument, setSelectedDocument] = [
    useSelectedDocumentStore(
      (state: SelectedDocumentStoreState) => state.selectedDocument
    ),
    useSelectedDocumentStore(
      (state: SelectedDocumentStoreState) => state.setSelectedDocument
    ),
  ];

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);

    // set the selected document to null
    setSelectedDocument(null);

    // Cleanup local storage
    deleteThumbsLocalStorage(props.docInfo.docID);
    const newDocList = await deleteDocFromLocalStorage(props.docInfo.docID);

    // Update available docs
    setFileList(newDocList);
    const keyValuesByDoc = await getKeyValuePairsByDoc();
    setDocData(keyValuesByDoc);
  };
  return (
    <Button variant="contained" color="secondary" onClick={handleDelete}>
      Confirm Delete
    </Button>
  );
};

const DownloadConfirm = (props: { docInfo: DocumentInfo }) => {
  const makeJSONDownloadable = (keyValuePairs: Object) => {
    return (
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(keyValuePairs))
    );
  };

  const makeCSVDownloadable = (keyValuePairs: KeyValuePairs) => {
    let csv = "Key:,Value:\n";
    Object.keys(keyValuePairs).forEach((key: string) => {
      const value = keyValuePairs[key].includes(",")
        ? `"${keyValuePairs[key]}"`
        : keyValuePairs[key];
      csv += key + "," + value + "\n";
    });
    return "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  };
  return (
    <>
      <Typography>Download as:</Typography>
      <Button
        size="small"
        download={`${props.docInfo.docName}.json`}
        variant="outlined"
        href={makeJSONDownloadable(props.docInfo.keyValuePairs)}
      >
        JSON
      </Button>{" "}
      <Button
        size="small"
        download={`${props.docInfo.docName}.csv`}
        variant="outlined"
        href={makeCSVDownloadable(props.docInfo.keyValuePairs)}
      >
        CSV
      </Button>
    </>
  );
};

const ButtonsBox = memo(
  (props: {
    docInfo: DocumentInfo;
    hovering: boolean;
    errorGettingFile: boolean;
    isSelected: boolean;
  }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialog] = useState<"delete" | "download">();
    const [setFileUrl, setLines, setKonvaModalOpen, openDocInNewTab] = [
      useStore((state: State) => state.setFileUrl),
      useStore((state: State) => state.setLines),
      useStore((state: State) => state.setKonvaModalOpen),
      useStore((state: State) => state.openDocInNewTab),
    ];

    const [selectedDocument, setSelectedDocument] = [
      useSelectedDocumentStore(
        (state: SelectedDocumentStoreState) => state.selectedDocument
      ),
      useSelectedDocumentStore(
        (state: SelectedDocumentStoreState) => state.setSelectedDocument
      ),
    ];

    const keyValuePairs = props.docInfo.keyValuePairs;
    const fileUrl = props.docInfo.pdf;
    const lines = props.docInfo.lines;

    // click away
    const handleClickAway = () => {
      setDialogOpen(false);
    };

    // handle delete click
    const handleDeleteClick = (e: MouseEvent) => {
      e.stopPropagation();
      // Change dialog text and open dialog
      setDialogOpen(true);
      setDialog("delete");
    };

    // handle download click
    const handleDownloadClick = (e: MouseEvent) => {
      e.stopPropagation();
      setDialogOpen(true);
      setDialog("download");
    };

    // handle view pdf click
    const handleViewPdfClick = (e: MouseEvent) => {
      e.stopPropagation();

      // Set selected doc, as this button is still in the dialog box
      setSelectedDocument(props.docInfo);

      // Set data for PdfViewer
      setFileUrl(fileUrl);
      setLines(lines);
      setKonvaModalOpen(true);
    };

    // handle complete forms click
    const handleCompleteFormsClick = (e: MouseEvent) => {
      e.stopPropagation();

      setFileUrl(fileUrl);
      setLines(lines);

      // set selected document
      setSelectedDocument(props.docInfo);

      !!Object.keys(keyValuePairs).length &&
        populateForms(PopulateFormsActionTypes.overwriteBlank, keyValuePairs);
    };

    return (
      <ButtonsBoxWrapper hovering={props.hovering}>
        <Collapse in={!dialogOpen}>
          <CollapseInnerWrapper>
            <ButtonsFlexContainer className={"flex-container"}>
              <StyledChip
                size="small"
                label="Complete Forms"
                onClick={handleCompleteFormsClick}
                variant="outlined"
                isSelected={props.isSelected}
              />
              {openDocInNewTab ? (
                <StyledATag
                  href={LOCAL_MODE ? "" : chrome.runtime.getURL("docview.html")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <StyledChip
                    size="small"
                    label="View PDF"
                    variant="outlined"
                    onClick={handleViewPdfClick}
                    disabled={props.errorGettingFile}
                    isSelected={props.isSelected}
                  />
                </StyledATag>
              ) : (
                <StyledChip
                  size="small"
                  label="View PDF"
                  variant="outlined"
                  onClick={handleViewPdfClick}
                  disabled={props.errorGettingFile}
                  isSelected={props.isSelected}
                />
              )}

              <FlexIconButton
                onClick={handleDeleteClick}
                style={{ marginLeft: "-0.25em" }}
              >
                <StyledDeleteIcon isSelected={props.isSelected} />
              </FlexIconButton>
              <FlexIconButton onClick={handleDownloadClick} edge={"start"}>
                <StyledGetAppIcon isSelected={props.isSelected} />
              </FlexIconButton>
            </ButtonsFlexContainer>
          </CollapseInnerWrapper>
        </Collapse>

        <ClickAwayListener
          mouseEvent="onMouseDown"
          touchEvent="onTouchStart"
          onClickAway={handleClickAway}
        >
          <Collapse in={dialogOpen}>
            <CollapseInnerWrapper>
              <ButtonsFlexContainer>
                {dialogType === "delete" ? (
                  <DeleteConfirm docInfo={props.docInfo} />
                ) : (
                  <div>
                    <DownloadConfirm docInfo={props.docInfo} />
                  </div>
                )}
              </ButtonsFlexContainer>
            </CollapseInnerWrapper>
          </Collapse>
        </ClickAwayListener>
      </ButtonsBoxWrapper>
    );
  }
);

export default ButtonsBox;
