import React, { useState, useEffect, createContext, useContext } from "react";
import styled from "styled-components";

import { useState as useSpecialHookState } from "@hookstate/core";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

// OLD
import { Dialog } from "@blueprintjs/core";

// NEW
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import { colors } from "./../common/colors";
import { getKeyValuePairsByDoc, KeyValuesByDoc } from "./KeyValuePairs";
import { globalSelectedFileState } from "./DocViewer";

import uuidv from "uuid";

const ManualSelectWrapper = styled.div`
  width: 100%;

  h4 {
    margin: 0.4em;
    margin-left: 1em;
  }
`;

const ManualSelectButton = styled.button`
  border: 1px solid white;
  border-radius: 5px;
  font-weight: bold;
  background-color: #f9e526;
  padding: 0.3em 1.3em;
  margin: 0 0.4em 0.4em 1em;

  :hover {
    opacity: 0.5;
  }
`;

const ManualSelectOverlay = styled(Dialog)`
  width: auto;
  height: auto;
`;

const CurrentSelectionWrapper = styled.div`
  padding: 1em 2em;
  background-color: ${colors.CLOSEST_MATCH_ROW};

  h3 {
    margin: 0.8em 0 0.5em 0;
  }
`;

const CurrentSelection = styled.p`
  margin: 0;
  background-color: ${colors.CURRENT_SELECTION_LIGHTBLUE};
  padding: 1em;
  border-radius: 5px;
  border: 0.5px solid ${colors.FONT_BLUE};
`;

// NEW
const StyledButton = styled(Button)`
  color: red;
  margin: 1em;
`;

const Polygon = ({ lineGeometry, docImageURL }: any) => {
  const [color, setColor] = useState("transparent");
  const [filled, setFilled] = useState(false);

  const { setCurrentSelection } = useContext(CurrentSelectionContext);

  const fillAndSetCurrentSelection = () => {
    if (!filled) {
      setCurrentSelection((prevCurrentSelection: any) => {
        return {
          ...prevCurrentSelection,
          [lineGeometry.ID]: lineGeometry.Text,
        };
      });
      setFilled(true);
    }
    if (filled) {
      setCurrentSelection((prevCurrentSelection: any) => {
        delete prevCurrentSelection[lineGeometry.ID];
        return { ...prevCurrentSelection };
      });
      setFilled(false);
    }
  };

  return (
    <Line
      onClick={fillAndSetCurrentSelection}
      onMouseEnter={() => {
        if (filled) return;
        setColor(colors.MANUAL_SELECT_RECT_FILL);
      }}
      onMouseLeave={() => {
        if (filled) return;
        setColor("transparent");
      }}
      points={Array.prototype.concat.apply(
        [],
        lineGeometry.Coordinates.map((geometry: any) => [
          docImageURL.width * geometry.X,
          docImageURL.height * geometry.Y,
        ])
      )}
      closed
      fill={color}
      stroke={colors.MANUAL_SELECT_RECT_STROKE}
    />
  );
};

const CurrentSelectionContext = createContext({} as any);

const Header = ({ docImageURL, currentSelection }: any) => {
  return (
    <CurrentSelectionWrapper
      style={{
        width: `${docImageURL.width}px`,
      }}
    >
      <p>
        <i>
          <strong>Click</strong> to select a line; <strong>Click</strong> again
          to unselect; press <strong>Return</strong> key to fill.
        </i>
      </p>
      {Object.keys(currentSelection).length > 0 && (
        <div>
          <p>
            <strong>Current Selection:</strong>
          </p>
          <CurrentSelection>
            {Object.keys(currentSelection).map(
              (key, i) => currentSelection[key] + " "
            )}
          </CurrentSelection>
        </div>
      )}
    </CurrentSelectionWrapper>
  );
};

export const ManualSelect = ({ eventObj }: any) => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [docImageURL, setDocImageURL] = useState({} as any);
  const [currentLinesGeometry, setCurrentLinesGeometry] = useState([] as any);
  const [currentSelection, setCurrentSelection] = useState({} as any);

  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);

  const [image] = useImage(docImageURL.url);

  const docData = getKeyValuePairsByDoc();

  const selectedDocData = docData.filter(
    (doc) => doc.docID === globalSelectedFile.get()
  )[0];

  const getImageAndGeometryFromServer = async (doc: KeyValuesByDoc) => {
    const docName = doc.docName;
    const docType = doc.docType;
    const docID = doc.docID;

    // get doc image
    const docImageResponse: any = await fetch(
      `${
        process.env.REACT_APP_API_PATH
      }/api/doc-image/${docID}/${encodeURIComponent(`
        ${docName}.${docType}`)}`,
      {
        method: "GET",
      }
    );

    const blob = await docImageResponse.blob();
    const objectURL = await URL.createObjectURL(blob);

    // get image dimensions
    const img = new Image();
    img.src = objectURL;
    let urlObj: any = {
      url: objectURL,
    };
    img.onload = function (this: any) {
      urlObj["width"] = this.naturalWidth;
      urlObj["height"] = this.naturalHeight;
    };

    setDocImageURL(urlObj);

    // get doc field data
    const linesGeometryResponse: any = await fetch(
      `${
        process.env.REACT_APP_API_PATH
      }/api/lines-geometry/${docID}/${encodeURIComponent(`
    ${docName}`)}`,
      {
        method: "GET",
      }
    );

    const linesGeometry = (
      await linesGeometryResponse.json()
    ).linesGeometry.map((lineGeometry: any) => {
      //@ts-ignore
      return { ...lineGeometry, ID: uuidv() };
    });

    setCurrentLinesGeometry(linesGeometry);
  };

  // return key listener
  useEffect(() => {
    // needs to be inside useEffect so can reference the same instance of the callback function so can remove on cleanup
    function keydownListener(e: any) {
      if (e.keyCode === 13) {
        setOverlayOpen(false);
        eventObj.target.value = Object.keys(currentSelection)
          .map((key) => currentSelection[key])
          .join(" ");
      }
    }
    document.addEventListener("keydown", keydownListener);
    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [currentSelection]);

  const clickHandler = () => {
    setOverlayOpen(true);
    getImageAndGeometryFromServer(selectedDocData);
  };

  /////// NEW ///////
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      typography: {
        padding: theme.spacing(2),
      },
    })
  );

  const classes = useStyles();
  console.log("classes, ", classes);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  console.log("open, ", open);
  console.log("anchorEl, ", anchorEl);

  return (
    <ManualSelectWrapper>
      <div>
        <h4>{selectedDocData.docName}</h4>
      </div>
      <Button
        aria-describedby={id}
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        Open Popover
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Typography className={classes.typography}>
          The content of the Popover.
        </Typography>
      </Popover>

      {/* <ManualSelectButton onClick={clickHandler}>
        Manual Select
      </ManualSelectButton>
      <ManualSelectOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      >
        <Header docImageURL={docImageURL} currentSelection={currentSelection} />
        <Stage width={docImageURL.width} height={docImageURL.height}>
          <Layer>
            <KonvaImage image={image} />
            <CurrentSelectionContext.Provider
              value={{ currentSelection, setCurrentSelection }}
            >
              {currentLinesGeometry.map((lineGeometry: any, ndx: number) => {
                return (
                  <Polygon
                    key={ndx}
                    lineGeometry={lineGeometry}
                    docImageURL={docImageURL}
                  />
                );
              })}
            </CurrentSelectionContext.Provider>
          </Layer>
        </Stage>
      </ManualSelectOverlay> */}
    </ManualSelectWrapper>
  );
};
