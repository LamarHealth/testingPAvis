import React, { useState, createContext, useContext } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import styled from "styled-components";

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import { colors } from "./../common/colors";
import { KonvaModalContext } from "./ManualSelect";

const CurrentSelectionWrapper = styled.div`
  padding: 1em 2em;
  background-color: ${colors.MANUAL_SELECT_HEADER};
  box-sizing: border-box;
`;

const CurrentSelection = styled(Typography)`
  margin: 0;
  background-color: ${colors.CURRENT_SELECTION_LIGHTBLUE};
  padding: 1em;
  border-radius: 5px;
  border: 0.5px solid ${colors.FONT_BLUE};
`;

const CurrentSelectionContext = createContext({} as any);

const Polygon = ({ lineGeometry, docImageURL }: any) => {
  const [color, setColor] = useState("transparent");
  const { filled, setFilled, setCurrentSelection } = useContext(
    CurrentSelectionContext
  );
  const isFilled = filled[lineGeometry.ID] ? true : false;

  const fillAndSetCurrentSelection = () => {
    if (!isFilled) {
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
    if (isFilled) {
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
      fill={isFilled ? colors.MANUAL_SELECT_RECT_FILL : color}
      stroke={colors.MANUAL_SELECT_RECT_STROKE}
    />
  );
};

const Header = ({ docImageURL, currentSelection }: any) => {
  return (
    <CurrentSelectionWrapper
      style={{
        width: `${docImageURL.width}px`,
      }}
    >
      <Typography>
        <Box fontStyle="italic">
          <b>Click</b> to select a line; <b>Click</b> again to unselect; press{" "}
          <b>Return</b> key to fill.
        </Box>
      </Typography>
      {Object.keys(currentSelection).length > 0 && (
        <div>
          <Typography>
            <Box fontStyle="fontWeightBold">
              <strong>Current Selection:</strong>
            </Box>
          </Typography>
          <CurrentSelection>
            {Object.keys(currentSelection).map(
              (key) => currentSelection[key] + " "
            )}
          </CurrentSelection>
        </div>
      )}
    </CurrentSelectionWrapper>
  );
};

export const KonvaModal = () => {
  const {
    docImageURL,
    currentSelection,
    image,
    filled,
    setFilled,
    setCurrentSelection,
    currentLinesGeometry,
  } = useContext(KonvaModalContext);
  return (
    <>
      <Header docImageURL={docImageURL} currentSelection={currentSelection} />
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
    </>
  );
};