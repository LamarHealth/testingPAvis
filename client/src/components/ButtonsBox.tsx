import React, { useState, useContext, memo, MouseEvent } from "react";

import $ from "jquery";
import styled from "styled-components";
import { useStore } from "../contexts/ZustandStore";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";

import { FileContext, DocumentInfo, IsSelected } from "./DocViewer";
import { KeyValuesByDoc, getEditDistanceAndSort } from "./KeyValuePairs";
import { updateThumbsLocalStorage } from "./docThumbnails";
import {
  handleFreightTerms,
  assignTargetString,
} from "./libertyInputsDictionary";
import { renderAccuracyScore } from "./AccuracyScoreCircle";
import { colors, colorSwitcher } from "../common/colors";
import { SIDEBAR_THUMBNAIL_WIDTH } from "../common/constants";

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
      ? Number(props.boxWidth.replace("px", "")) -
        Number(SIDEBAR_THUMBNAIL_WIDTH.replace("px", "")) +
        "px"
      : "auto"};
`;

const ButtonsFlexContainer = styled.div`
  height: 100%;
  display: flex;
  margin: 0 0.5em;
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
    )}
`;

const StyledDeleteIcon = styled(DeleteIcon)`
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")};
`;

const StyledGetAppIcon = styled(GetAppIcon)`
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")};
`;

const populateForms = (docID: string, docData: KeyValuesByDoc[]) => {
  $(document).ready(() => {
    const keyValuePairs = docData.filter(
      (doc: KeyValuesByDoc) => doc.docID === docID
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

const DeleteConfirm = (props: { docInfo: DocumentInfo }) => {
  const fileInfoContext = useContext(FileContext);
  const setSelectedFile = useStore((state) => state.setSelectedFile);

  const handleDelete = () => {
    setSelectedFile(null);
    fileInfoContext.fileDispatch({
      type: "remove",
      documentInfo: props.docInfo,
    });
    updateThumbsLocalStorage(props.docInfo.docID.toString(), "delete");
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

const ButtonsBox = memo(
  (props: {
    docInfo: DocumentInfo;
    hovering: boolean;
    boxHeight: string | null;
    boxWidth: string | null;
    errorGettingFile: boolean;
    isSelected: boolean;
  }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialog] = useState<"delete" | "download">();
    const [docData, setSelectedFile, setKonvaModalOpen] = [
      useStore((state) => state.docData),
      useStore((state) => state.setSelectedFile),
      useStore((state) => state.setKonvaModalOpen),
    ];

    // click away
    const handleClickAway = () => {
      setDialogOpen(false);
    };

    // handle delete click
    const handleDeleteClick = (e: MouseEvent) => {
      e.stopPropagation();
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
      setSelectedFile(props.docInfo.docID.toString());
      setKonvaModalOpen(true);
    };

    // handle complete forms click
    const handleCompleteFormsClick = (e: MouseEvent) => {
      e.stopPropagation();
      populateForms(props.docInfo.docID.toString(), docData);
      setSelectedFile(props.docInfo.docID.toString());
    };

    return (
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
              <StyledChip
                size="small"
                label="Complete Forms"
                onClick={handleCompleteFormsClick}
                variant="outlined"
                isSelected={props.isSelected}
              />
              <StyledChip
                size="small"
                label="View PDF"
                variant="outlined"
                onClick={handleViewPdfClick}
                disabled={props.errorGettingFile}
                isSelected={props.isSelected}
              />
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
    );
  }
);

export default ButtonsBox;
