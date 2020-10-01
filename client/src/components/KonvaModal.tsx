import React, { useState, createContext, useContext, useRef } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import styled from "styled-components";

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import { colors } from "../common/colors";
import { KONVA_MODAL_STICKY_HEADER_SHADOW } from "../common/constants";
import { useStore } from "../contexts/ZustandStore";
import {
  KonvaModalContext,
  LinesGeometry,
  LinesSelection,
  Filled,
} from "./ManualSelect";
import { DocImageDimensions } from "./RenderModal";
import { useEffect } from "react";

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

const BigButton = styled.button`
  color: white;
  margin: 1em 0 1em 1.5em;
  border: 1px solid white;
  border-radius: 5px;
  max-width: 6em;
  min-width: 6em;
  max-height: 2em;
  min-height: 2em;
  font-weight: bold;
  :hover {
    opacity: 0.5;
  }
  flex-basis: auto;
  flex-grow: 0;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const HeaderWrapper = styled.div`
  padding: 1em 2em;
  background-color: ${colors.MANUAL_SELECT_HEADER};
  box-sizing: border-box;

  // mui font styles
  font-size: 1rem;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.00938em;
  input {
    font-size: 1rem;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938em;
  }
  p {
    margin: 0;
  }
`;

// const CurrentSelectionTypography = styled(Typography)`
//   margin: 0;
//   background-color: ${colors.CURRENT_SELECTION_LIGHTBLUE};
//   padding: 1em;
//   border-radius: 5px;
//   border: 0.5px solid ${colors.FONT_BLUE};
//   flex-basis: auto;
//   flex-grow: 10;
// `;

const CurrentSelectionWrapper = styled.div`
  flex-basis: auto;
  flex-grow: 10;
`;

const CurrentSelectionDiv = styled.div`
  padding: 0.75em;
  border-radius: 5px;
  border: 0.5px solid ${colors.FONT_BLUE};
  width: 100%;
  box-sizing: border-box;
  cursor: text;
`;

const StickyHeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  box-shadow: ${KONVA_MODAL_STICKY_HEADER_SHADOW};
`;

const CursorPointerWrapper = styled.div`
  cursor: pointer;
`;

const CurrentSelectionContext = createContext({} as any);

const Polygon = ({
  lineGeometry,
  docImageDimensions,
}: {
  lineGeometry: LinesGeometry;
  docImageDimensions: DocImageDimensions;
}) => {
  const [color, setColor] = useState("transparent");
  const { filled, setFilled, setLinesSelection } = useContext(
    CurrentSelectionContext
  );
  const isFilled = filled[lineGeometry.ID] ? true : false;
  const [isMouseDown, setIsMouseDown] = useState(false as boolean);

  const fillAndSetCurrentSelection = () => {
    if (!isFilled) {
      setLinesSelection((prevLinesSelection: LinesSelection) => {
        return {
          ...prevLinesSelection,
          [lineGeometry.ID]: { line: lineGeometry.Text },
        };
      });
      setFilled((otherFilleds: Filled) => {
        return {
          ...otherFilleds,
          [lineGeometry.ID]: true,
        };
      });
    }
    if (isFilled) {
      setLinesSelection((prevLinesSelection: LinesSelection) => {
        delete prevLinesSelection[lineGeometry.ID];
        return { ...prevLinesSelection };
      });
      setFilled((otherFilleds: Filled) => {
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
        lineGeometry.Coordinates.map((geometry) => [
          docImageDimensions.width * geometry.X,
          docImageDimensions.height * geometry.Y,
        ])
      )}
      closed
      fill={
        isMouseDown
          ? colors.MANUAL_SELECT_RECT_FILL_MOUSEDOWN
          : isFilled
          ? colors.MANUAL_SELECT_RECT_FILL
          : color
      }
      stroke={colors.MANUAL_SELECT_RECT_STROKE}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
    />
  );
};

const EditableSpan = ({ content }: { content: string }) => {
  return <span contentEditable>{content}</span>;
};

const Header = ({
  docImageDimensions,
  linesSelection,
  setLinesSelection,
}: {
  docImageDimensions: DocImageDimensions;
  linesSelection: LinesSelection;
  setLinesSelection: any;
}) => {
  const { errorLine, handleSubmitAndClear, handleClear } = useContext(
    KonvaModalContext
  );
  const editableDivRef = useRef(null as HTMLDivElement | null);
  const [editedText, setEditedText] = useState(undefined as string | undefined);

  // update editable on linesSelection change
  useEffect(() => {
    if (editableDivRef.current) {
      // const selectedLines = Object.entries(linesSelection)
      //   // .filter((entry) => !entry[1].edited)
      //   .map((entry) => {
      //     return `<span contentEditable="true">${entry[1].line}</span>`;
      //   })
      //   .join(" ");
      // editableDivRef.current.innerHTML = selectedLines;
      // console.log("linesSelection, ", linesSelection);
      // console.log("editedText, ", editedText);
    }
  }, [linesSelection]);

  // listen for changes to editable
  useEffect(() => {
    if (editableDivRef.current) {
      const node = editableDivRef.current as Node;
      const config = {
        // attributes: true,
        // childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: true,
      };
      const callback = function (
        mutationsList: MutationRecord[],
        observer: MutationObserver
      ) {
        // const editedText = editableDivRef.current?.innerText as string;
        // console.log("editedText, ", editedText);
        // for (const mutation of mutationsList) {
        //   if (mutation.type === "characterData") {
        //     // Object.entries(linesSelection).forEach((entry) => {
        //     //   if (!editedText.includes(entry[1].line)) {
        //     //     setLinesSelection((prevLinesSelection: LinesSelection) => {
        //     //       return {
        //     //         ...prevLinesSelection,
        //     //         [entry[0]]: {
        //     //           ...prevLinesSelection[entry[0]],
        //     //           edited: true,
        //     //         },
        //     //       };
        //     //     });
        //     //   }
        //     // });
        //   }
        // }
        // let edited = false;
        // mutationsList.forEach(
        //   (mutation) => mutation.type === "characterData" && (edited = true)
        // );
        // if (edited) {
        //   const currentEditedText = editableDivRef.current?.innerText as string;
        //   setEditedText(currentEditedText);
        //   Object.entries(linesSelection).forEach((entry) => {
        //     if (!currentEditedText.includes(entry[1].line)) {
        //       setLinesSelection((prevLinesSelection: LinesSelection) => {
        //         return {
        //           ...prevLinesSelection,
        //           [entry[0]]: {
        //             ...prevLinesSelection[entry[0]],
        //             edited: true,
        //           },
        //         };
        //       });
        //     }
        //   });
        // }
      };
      const observer = new MutationObserver(callback);
      observer.observe(node, config);
      return () => observer.disconnect();
    }
  });

  return (
    <HeaderWrapper
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
      {Object.keys(linesSelection).length > 0 && (
        <div>
          <Typography>
            <Box fontStyle="fontWeightBold">
              <strong>Current Selection:</strong>
            </Box>
          </Typography>
          <FlexContainer>
            {/* <CurrentSelectionTypography>
              {Object.keys(linesSelection).map(
                (key) => linesSelection[key] + " "
              )}
            </CurrentSelectionTypography> */}
            <CurrentSelectionWrapper>
              <CurrentSelectionDiv
                ref={editableDivRef}
                contentEditable
                role={"textbox"}
              >
                {Object.entries(linesSelection).map((entry) => (
                  <EditableSpan content={entry[1].line + " "} />
                ))}
              </CurrentSelectionDiv>
            </CurrentSelectionWrapper>

            <BigButton
              onClick={handleClear}
              style={{ backgroundColor: `${colors.RED}` }}
            >
              Clear
            </BigButton>
            <BigButton
              onClick={handleSubmitAndClear}
              style={{ backgroundColor: `${colors.FILL_BUTTON}` }}
            >
              Submit
            </BigButton>
          </FlexContainer>
        </div>
      )}
      {errorLine && (
        <Typography>
          <Box fontStyle="italic" color={`${colors.RED}`}>
            {errorLine}
          </Box>
        </Typography>
      )}
    </HeaderWrapper>
  );
};

export const KonvaModal = () => {
  const {
    linesSelection,
    image,
    filled,
    setFilled,
    setLinesSelection,
    currentLinesGeometry,
    docImageDimensions,
  } = useContext(KonvaModalContext);
  const setKonvaModalOpen = useStore((state) => state.setKonvaModalOpen);

  return (
    <>
      <StickyHeaderWrapper>
        <CloseButton onClick={() => setKonvaModalOpen(false)}>X</CloseButton>
        <Header
          docImageDimensions={docImageDimensions}
          linesSelection={linesSelection}
          setLinesSelection={setLinesSelection}
        />
      </StickyHeaderWrapper>
      <CursorPointerWrapper>
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
                setLinesSelection,
              }}
            >
              {currentLinesGeometry.map(
                (lineGeometry: LinesGeometry, ndx: number) => {
                  return (
                    <Polygon
                      key={ndx}
                      lineGeometry={lineGeometry}
                      docImageDimensions={docImageDimensions}
                    />
                  );
                }
              )}
            </CurrentSelectionContext.Provider>
          </Layer>
        </Stage>
      </CursorPointerWrapper>
    </>
  );
};
