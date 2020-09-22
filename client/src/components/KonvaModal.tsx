import React, { useState, createContext, useContext } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import styled from "styled-components";

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import { colors } from "../common/colors";
import { KonvaModalContext } from "./ManualSelect";

// cannot import from SelectModal... likely a shadow dom issue
const CloseButton = styled.button`
  float: right;
  margin: 1em;
  height: 3em;
  width: 3em;
  background: none;
  border: none;
  border-radius: 50%;
  transition: 0.5s;

  :hover {
    border: 1px solid ${colors.DROPZONE_TEXT_GREY};
  }
`;

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

const Polygon = ({ lineGeometry, docImageDimensions }: any) => {
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
          docImageDimensions.width * geometry.X,
          docImageDimensions.height * geometry.Y,
        ])
      )}
      closed
      fill={isFilled ? colors.MANUAL_SELECT_RECT_FILL : color}
      stroke={colors.MANUAL_SELECT_RECT_STROKE}
    />
  );
};

const Header = ({ docImageDimensions, currentSelection }: any) => {
  return (
    <CurrentSelectionWrapper
      style={{
        width: `${docImageDimensions.width}px`,
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
    currentSelection,
    image,
    filled,
    setFilled,
    setCurrentSelection,
    currentLinesGeometry,
    setKonvaModalOpen,
    docImageDimensions,
  } = useContext(KonvaModalContext);
  return (
    <>
      <CloseButton onClick={() => setKonvaModalOpen(false)}>X</CloseButton>
      <Header
        docImageDimensions={docImageDimensions}
        currentSelection={currentSelection}
      />
      <Stage
        width={docImageDimensions.width}
        height={docImageDimensions.height}
      >
        <Layer>
          <KonvaImage
            image={image}
            width={docImageDimensions.width}
            height={docImageDimensions.height}
          />
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
                  docImageDimensions={docImageDimensions}
                />
              );
            })}
          </CurrentSelectionContext.Provider>
        </Layer>
      </Stage>
    </>
  );
};