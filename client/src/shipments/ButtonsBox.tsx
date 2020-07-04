import React, { useState, useContext } from "react";

import {
  createState as createSpecialHookState,
  useState as useSpecialHookState,
} from "@hookstate/core";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

import {
  FileContext,
  globalSelectedFileState,
  DocumentInfo,
} from "./DocViewer";

const DeleteConfirm = (props: { docInfo: DocumentInfo }) => {
  const fileInfoContext = useContext(FileContext);
  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);

  const handleDelete = () => {
    globalSelectedFile.set("");
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

  const handleClickAway = () => {
    setDialogOpen(false);
  };
  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDialogOpen(true);
    setDialog("delete");
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDialogOpen(true);
    setDialog("download");
  };

  return (
    <>
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
