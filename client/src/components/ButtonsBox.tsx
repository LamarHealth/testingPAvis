import React, { useState, useContext, memo, MouseEvent } from "react";

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
import {
  updateThumbsLocalStorage,
  updateThumbsActionTypes,
} from "./docThumbnails";
import { KeyValuesByDoc } from "./KeyValuePairs";
import {
  populateForms,
  PopulateFormsActionTypes,
} from "./ScoreChiclet/functions";
import { colors, colorSwitcher } from "../common/colors";
import { DOC_CARD_HEIGHT } from "../common/constants";

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

const StyledDeleteIcon = styled(DeleteIcon)`
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")};
`;

const StyledGetAppIcon = styled(GetAppIcon)`
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")};
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
    updateThumbsLocalStorage(
      props.docInfo.docID.toString(),
      updateThumbsActionTypes.delete
    );
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
    const docID = props.docInfo.docID.toString();

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
      setSelectedFile(docID);
      setKonvaModalOpen(true);
    };

    // handle complete forms click
    const handleCompleteFormsClick = (e: MouseEvent) => {
      e.stopPropagation();
      populateForms(
        PopulateFormsActionTypes.bestGuess,
        docData.filter((doc: KeyValuesByDoc) => doc.docID === docID)[0]
      );
      setSelectedFile(props.docInfo.docID.toString());
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
