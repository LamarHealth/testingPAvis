import React, { useState, useEffect, createContext, useContext } from "react";

import { useState as useSpecialHookState } from "@hookstate/core";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

//@ts-ignore
import root from "react-shadow/material-ui";

import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { colors } from "./../common/colors";
import { getKeyValuePairsByDoc, KeyValuesByDoc } from "./keyValuePairs";
import { globalSelectedFileState } from "./DocViewer";
import { DropdownContext } from "./RenderModal";

import uuidv from "uuid";

const wrapperStyles = {
  width: "100%",
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
};

const buttonStyles = {
  border: "1px solid white",
  borderRadius: "5px",
  fontWeight: "bold",
  backgroundColor: "#f9e526",
  padding: "0.3em 1.3em",
  margin: "0 0.4em 0.4em 1em",
};

const currentSelectionWrapperStyles = {
  padding: "1em 2em",
  backgroundColor: `${colors.MANUAL_SELECT_HEADER}`,
  boxSizing: "border-box",
};

const currentSelectionStyles = {
  margin: 0,
  backgroundColor: `${colors.CURRENT_SELECTION_LIGHTBLUE}`,
  padding: "1em",
  borderRadius: "5px",
  border: `0.5px solid ${colors.FONT_BLUE}`,
};

const Polygon = ({ lineGeometry, docImageURL }: any) => {
  const [color, setColor] = useState("transparent");
  const { filled, setFilled, setCurrentSelection } = useContext(
    CurrentSelectionContext
  );
  const iAmFilled = filled[lineGeometry.ID] ? true : false;

  const fillAndSetCurrentSelection = () => {
    if (!iAmFilled) {
      setCurrentSelection((prevCurrentSelection: any) => {
        return {
          ...prevCurrentSelection,
          [lineGeometry.ID]: lineGeometry.Text,
        };
      });
      setFilled((otherFilleds: any) => {
        return {
          ...otherFilleds,
          [lineGeometry.ID]: true,
        };
      });
    }
    if (iAmFilled) {
      setCurrentSelection((prevCurrentSelection: any) => {
        delete prevCurrentSelection[lineGeometry.ID];
        return { ...prevCurrentSelection };
      });
      setFilled((otherFilleds: any) => {
        return {
          ...otherFilleds,
          [lineGeometry.ID]: false,
        };
      });
    }
  };

  return (
    <Line
      onClick={fillAndSetCurrentSelection}
      onMouseEnter={() => {
        setColor(colors.MANUAL_SELECT_RECT_FILL);
      }}
      onMouseLeave={() => {
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
      fill={iAmFilled ? colors.MANUAL_SELECT_RECT_FILL : color}
      stroke={colors.MANUAL_SELECT_RECT_STROKE}
    />
  );
};

const CurrentSelectionContext = createContext({} as any);

const Header = ({ docImageURL, currentSelection }: any) => {
  return (
    <div
      //@ts-ignore
      style={{
        ...currentSelectionWrapperStyles,
        width: `${docImageURL.width}px`,
      }}
    >
      <Typography>
        <i>
          <strong>Click</strong> to select a line; <strong>Click</strong> again
          to unselect; press <strong>Return</strong> key to fill.
        </i>
      </Typography>
      {Object.keys(currentSelection).length > 0 && (
        <div>
          <Typography>
            <strong>Current Selection:</strong>
          </Typography>
          <Typography style={currentSelectionStyles}>
            {Object.keys(currentSelection).map(
              (key, i) => currentSelection[key] + " "
            )}
          </Typography>
        </div>
      )}
    </div>
  );
};

const ButtonContext = createContext({} as any);

const ManualSelectButton = () => {
  const { id, popoverHandleClick } = useContext(ButtonContext);
  const [hover, setHover] = useState({}) as any;
  return (
    <Button
      aria-describedby={id}
      variant="contained"
      color="primary"
      //@ts-ignore
      style={{ ...buttonStyles, ...hover }}
      onMouseEnter={() => setHover({ opacity: 0.5 })}
      onMouseLeave={() => setHover({ opacity: 1 })}
      onClick={popoverHandleClick}
    >
      <Typography style={{ margin: "0.2em 0.5em" }}>Manual Select</Typography>
    </Button>
  );
};

export const ManualSelect = ({ eventObj }: any) => {
  const [
    manualSelAnchorEl,
    setManualSelAnchorEl,
  ] = useState<HTMLButtonElement | null>(null);
  const [docImageURL, setDocImageURL] = useState({} as any);
  const [currentLinesGeometry, setCurrentLinesGeometry] = useState([] as any);
  const [currentSelection, setCurrentSelection] = useState({} as any);
  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);
  const [image] = useImage(docImageURL.url);
  const [filled, setFilled] = useState({} as any);
  const { setModalAnchorEl } = useContext(DropdownContext);

  // popover
  const popoverOpen = Boolean(manualSelAnchorEl);
  const id = popoverOpen ? "docit-manual-select-modal" : undefined;

  const popoverHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setManualSelAnchorEl(event.currentTarget);
    getImageAndGeometryFromServer(selectedDocData);
  };

  const renderBackdrop = () => {
    // unfortunately not achievable via mui API or styled-components
    const popoverRoot = document.querySelector("#docit-manual-select-modal");
    const backdrop: any = popoverRoot?.children[0];
    backdrop.style.backgroundColor = colors.MANUAL_SELECT_POPOVER_BACKDROP;
  };

  const popoverHandleClose = () => {
    setManualSelAnchorEl(null);
  };

  // geometry
  const docData = getKeyValuePairsByDoc();
  const selectedDocData = docData.filter(
    (doc) => doc.docID === globalSelectedFile.get()
  )[0];

  const getImageAndGeometryFromServer = async (doc: KeyValuesByDoc) => {
    const docName = doc.docName;
    const docType = doc.docType;
    const docID = doc.docID;

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

    const img = new Image();
    img.src = objectURL;
    let urlObj: any = {
      url: objectURL,
    };
    img.onload = function (this: any) {
      urlObj["width"] = this.naturalWidth;
      urlObj["height"] = this.naturalHeight;
      urlObj["overlayPositionOffset"] =
        (window.innerWidth - this.naturalWidth) / 2;
    };

    setDocImageURL(urlObj);

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
        setManualSelAnchorEl(null);
        setModalAnchorEl(null);
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

  // rewriting pesky styles that penetrate the shadow DOM
  const rewriteStyles = () => {
    const popoverEl = document.getElementById("docit-manual-select-modal");
    if (!popoverEl) return;
    const shadowRoot = popoverEl?.children[2].children[0].shadowRoot;
    const alreadyExists = shadowRoot?.getElementById(
      "manual-select-style-overwrite"
    );
    if (alreadyExists) return;
    const newStyles = document.createElement("style");
    newStyles.innerHTML = `
      :host * {
        font-family: Roboto, Helvetica, Arial, sans-serif;
        font-size: 1em;
      }
    `;
    newStyles.type = "text/css";
    newStyles.id = "manual-select-style-overwrite";
    shadowRoot?.appendChild(newStyles);
  };

  useEffect(() => rewriteStyles());

  return (
    <div style={wrapperStyles}>
      <Typography variant="h3" style={{ margin: "1em" }}>
        {selectedDocData.docName}
      </Typography>
      <ButtonContext.Provider value={{ id, popoverHandleClick }}>
        <ManualSelectButton />
      </ButtonContext.Provider>
      <Popover
        id={id}
        open={popoverOpen}
        anchorEl={manualSelAnchorEl}
        onEnter={renderBackdrop}
        onClose={popoverHandleClose}
        anchorReference="anchorPosition"
        anchorPosition={{ top: 0, left: 0 }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        style={{
          left: `${docImageURL.overlayPositionOffset}px`,
        }}
      >
        <root.div>
          <Header
            docImageURL={docImageURL}
            currentSelection={currentSelection}
          />
          <Stage width={docImageURL.width} height={docImageURL.height}>
            <Layer>
              <KonvaImage image={image} />
              <CurrentSelectionContext.Provider
                value={{
                  filled,
                  setFilled,
                  setCurrentSelection,
                }}
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
        </root.div>
      </Popover>
    </div>
  );
};
