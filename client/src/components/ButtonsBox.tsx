import React, { useState, useContext } from "react";

import $ from "jquery";
import styled from "styled-components";
import { useStore } from "../contexts/ZustandStore";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";

import { FileContext, DocumentInfo } from "./DocViewer";
import { KeyValuesByDoc, getEditDistanceAndSort } from "./KeyValuePairs";
import {
  handleFreightTerms,
  assignTargetString,
} from "./libertyInputsDictionary";
import { renderAccuracyScore } from "./AccuracyScoreCircle";

const ButtonsBoxWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const ChipWrapper = styled.div`
  flex-basis: auto;
  display: flex;
  flex-direction: column;
`;

const ButtonsWrapper = styled.div`
  flex-basis: auto;
  flex-grow: 2;
  display: flex;
  justify-content: center;
  margin-left: 2em;
  align-items: center;
`;

const FlexIconButton = styled(IconButton)`
  flex-basis: auto;
  flex-grow: 1;
  padding: 0;
  min-height: 2.5em;
  max-height: 2.5em;
  min-width: 2.5em;
  max-width: 2.5em;
`;

const DeleteConfirm = (props: { docInfo: DocumentInfo }) => {
  const fileInfoContext = useContext(FileContext);
  const setSelectedFile = useStore((state) => state.setSelectedFile);

  const handleDelete = () => {
    setSelectedFile("");
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

const ButtonsBox = (props: { docInfo: DocumentInfo }) => {
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
    <>
      <ButtonsBoxWrapper>
        <ChipWrapper>
          <Chip
            label="Complete Forms on Page"
            onClick={() => {
              populateForms();
              setSelectedFile(props.docInfo.docID.toString());
            }}
            variant="outlined"
            style={{ marginBottom: "0.5em" }}
          />
          <Chip
            label="View PDF"
            variant="outlined"
            onClick={handleViewPdfClick}
          />
        </ChipWrapper>
        <ButtonsWrapper>
          <FlexIconButton onClick={handleDeleteClick}>
            <DeleteIcon />
          </FlexIconButton>
          <FlexIconButton onClick={handleDownloadClick}>
            <GetAppIcon />
          </FlexIconButton>
        </ButtonsWrapper>
      </ButtonsBoxWrapper>
      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={handleClickAway}
      >
        <Collapse in={dialogOpen}>
          <Divider style={{ margin: "1em 0em" }} />

          {dialogType === "delete" ? (
            <DeleteConfirm docInfo={props.docInfo} />
          ) : (
            <DownloadConfirm docInfo={props.docInfo} />
          )}
        </Collapse>
      </ClickAwayListener>
    </>
  );
};

export default ButtonsBox;
