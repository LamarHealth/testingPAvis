import React, { useState } from "react";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";

const DeleteConfirm = () => {
  return (
    <Button variant="contained" color="secondary">
      Confirm Delete
    </Button>
  );
};

const DownloadConfirm = () => {
  return (
    <>
      <Button variant="contained">JSON</Button>
      <Button variant="contained">CSV</Button>
    </>
  );
};

const ButtonsBox = () => {
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
          {dialogType === "delete" ? <DeleteConfirm /> : <DownloadConfirm />}
        </Collapse>
      </ClickAwayListener>
    </>
  );
};

export default ButtonsBox;
