import React, { useState, useContext, memo } from "react";

import $ from "jquery";
import styled from "styled-components";
import { useStore, checkFileError } from "../contexts/ZustandStore";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";

import { FileContext, DocumentInfo } from "./DocViewer";
import { DEFAULT_ERROR_MESSAGE } from "./../common/constants";
import { colors } from "./../common/colors";
import { KeyValuesByDoc, getEditDistanceAndSort } from "./KeyValuePairs";
import {
  handleFreightTerms,
  assignTargetString,
} from "./libertyInputsDictionary";
import { renderAccuracyScore } from "./AccuracyScoreCircle";

interface ButtonsBoxWrapperProps {
  boxHeight: string | null;
  boxWidth: string | null;
  hovering: boolean;
}

interface CollapseInnerWrapperProps {
  boxHeight: string | null;
  boxWidth: string | null;
}

const ButtonsBoxWrapper = styled.div`
  height: ${(props: ButtonsBoxWrapperProps) =>
    props.boxHeight ? props.boxHeight : "auto"};
  width: ${(props: ButtonsBoxWrapperProps) =>
    props.boxWidth
      ? Number(props.boxWidth.replace("px", "")) - 50 + "px"
      : "auto"};
  display: ${(props: ButtonsBoxWrapperProps) =>
    props.hovering ? "inherit" : "none"};
`;

const CollapseInnerWrapper = styled.div`
  height: ${(props: CollapseInnerWrapperProps) =>
    props.boxHeight ? props.boxHeight : "auto"};
  width: ${(props: CollapseInnerWrapperProps) =>
    props.boxWidth
      ? Number(props.boxWidth.replace("px", "")) - 50 + "px"
      : "auto"};
`;

const ButtonsFlexContainer = styled.div`
  height: 100%;
  display: flex;
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

const ErrorMessageWrapper = styled.div`
  margin: 1em 0;
  padding: 0.5em;
  background-color: ${colors.ERROR_BACKGROUND_RED};
`;

const DeleteConfirm = (props: { docInfo: DocumentInfo }) => {
  const fileInfoContext = useContext(FileContext);
  const setSelectedFile = useStore((state) => state.setSelectedFile);

  const handleDelete = () => {
    setSelectedFile(null);
    fileInfoContext.fileDispatch({
      type: "remove",
      documentInfo: props.docInfo,
    });
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

  const makeCSVDownloadable = (keyValuePairs: any) => {
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
        download={props.docInfo.docName}
        variant="outlined"
        href={makeCSVDownloadable(props.docInfo.keyValuePairs)}
      >
        CSV
      </Button>
    </>
  );
};

const ErrorMessage = ({ docID }: { docID: string }) => {
  const errorFiles = useStore((state) => state.errorFiles);
  const errorMsg = errorFiles[docID].errorMessage
    ? errorFiles[docID].errorMessage
    : DEFAULT_ERROR_MESSAGE;

  return (
    <ErrorMessageWrapper>
      <Typography>
        <i>
          <strong>Error</strong>: {errorMsg}
        </i>
      </Typography>
    </ErrorMessageWrapper>
  );
};

const ButtonsBox = memo(
  (props: {
    docInfo: DocumentInfo;
    hovering: boolean;
    isSelected: boolean;
    boxHeight: string | null;
    boxWidth: string | null;
  }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialog] = useState<"delete" | "download">();
    const [docData, setSelectedFile, setKonvaModalOpen, errorFiles] = [
      useStore((state) => state.docData),
      useStore((state) => state.setSelectedFile),
      useStore((state) => state.setKonvaModalOpen),
      useStore((state) => state.errorFiles),
    ];
    const docID = props.docInfo.docID.toString();
    const errorGettingFile = checkFileError(errorFiles, docID);

    // click away
    const handleClickAway = () => {
      setDialogOpen(false);
    };

    // delete click
    const handleDeleteClick = () => {
      setDialogOpen(true);
      setDialog("delete");
    };

    // download click
    const handleDownloadClick = () => {
      setDialogOpen(true);
      setDialog("download");
    };

    // view pdf click
    const handleViewPdfClick = () => {
      setSelectedFile(props.docInfo.docID.toString());
      setKonvaModalOpen(true);
    };

    // populate forms click
    const populateForms = () => {
      $(document).ready(() => {
        const keyValuePairs = docData.filter(
          (doc: KeyValuesByDoc) => doc.docID === props.docInfo.docID
        )[0];

        $("select").each(function () {
          handleFreightTerms(this, keyValuePairs);
        });

        $("input").each(function () {
          const targetString = assignTargetString(this);

          if (typeof targetString === "undefined") {
            return;
          }

          const areThereKVPairs =
            Object.keys(keyValuePairs.keyValuePairs).length > 0 ? true : false;

          if (!areThereKVPairs) {
            return;
          }

          const sortedKeyValuePairs = getEditDistanceAndSort(
            keyValuePairs,
            targetString,
            "lc substring"
          );

          if (
            sortedKeyValuePairs[0].distanceFromTarget < 0.5 ||
            sortedKeyValuePairs[0].value === ""
          ) {
            renderAccuracyScore("blank", this);
            $(this).prop("value", null);
          } else {
            renderAccuracyScore("value", this, sortedKeyValuePairs[0]);
            $(this).prop("value", sortedKeyValuePairs[0]["value"]);
          }
        });
      });
    };

    return (
      <div
        style={
          props.isSelected
            ? {
                backgroundColor: `${colors.DROPZONE_BACKGROUND_HOVER_LIGHTBLUE}`,
              }
            : { backgroundColor: "transparent" }
        }
      >
        {errorGettingFile && <ErrorMessage docID={docID} />}
        <ButtonsBoxWrapper
          hovering={props.hovering}
          boxHeight={props.boxHeight}
          boxWidth={props.boxWidth}
        >
          <Collapse in={!dialogOpen}>
            <CollapseInnerWrapper
              boxHeight={props.boxHeight}
              boxWidth={props.boxWidth}
            >
              <ButtonsFlexContainer className={"flex-container"}>
                <Chip
                  size="small"
                  label="Complete Forms"
                  onClick={() => {
                    populateForms();
                    setSelectedFile(props.docInfo.docID.toString());
                  }}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label="View PDF"
                  variant="outlined"
                  onClick={handleViewPdfClick}
                  disabled={errorGettingFile}
                />
                <FlexIconButton onClick={handleDeleteClick}>
                  <DeleteIcon />
                </FlexIconButton>
                <FlexIconButton onClick={handleDownloadClick}>
                  <GetAppIcon />
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
              <CollapseInnerWrapper
                boxHeight={props.boxHeight}
                boxWidth={props.boxWidth}
              >
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
      </div>
    );
  }
);

export default ButtonsBox;
