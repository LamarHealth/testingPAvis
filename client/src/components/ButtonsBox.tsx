import React, { useState, useContext } from "react";

import $ from "jquery";
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
import { renderAccuracyScore, renderBlankChiclet } from "./AccuracyScoreCircle";

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
  const setSelectedFile = useStore((state) => state.setSelectedFile);
  const docData = useStore((state) => state.docData);

  // click away
  const handleClickAway = () => {
    setDialogOpen(false);
  };
  // delete click
  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDialogOpen(true);
    setDialog("delete");
  };
  // download click
  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDialogOpen(true);
    setDialog("download");
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
          renderBlankChiclet(this);
          $(this).prop("value", null);
        } else {
          renderAccuracyScore(this, sortedKeyValuePairs[0]);
          $(this).prop("value", sortedKeyValuePairs[0]["value"]);
        }
      });
    });
  };

  return (
    <>
      <Chip
        label="Complete Forms on Page"
        onClick={() => {
          populateForms();
          setSelectedFile(props.docInfo.docID.toString());
        }}
        variant="outlined"
        style={{ marginRight: "0.5em" }}
      />
      <IconButton onClick={handleDeleteClick}>
        <DeleteIcon />
      </IconButton>
      <IconButton onClick={handleDownloadClick}>
        <GetAppIcon />
      </IconButton>
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
