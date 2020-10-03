import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import styled from "styled-components";
import ContentEditable from "react-contenteditable";

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import { colors } from "../common/colors";
import { KONVA_MODAL_STICKY_HEADER_SHADOW } from "../common/constants";
import { useStore } from "../contexts/ZustandStore";
import {
  KonvaModalContext,
  LinesGeometry,
  LinesSelection,
} from "./ManualSelect";
import { DocImageDimensions } from "./RenderModal";

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

const StyledContentEditable = styled(ContentEditable)`
  padding: 0.75em;
  border-radius: 5px;
  border: 0.5px solid ${colors.FONT_BLUE};
  width: 100%;
  box-sizing: border-box;
  cursor: text;
`;

const StyledInput = styled.input`
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
  const { linesSelection, setLinesSelection, inputElRef } = useContext(
    CurrentSelectionContext
  );
  const isFilled = linesSelection[lineGeometry.ID] ? true : false;
  const [isMouseDown, setIsMouseDown] = useState(false as boolean);

  const fillAndSetCurrentSelection = () => {
    if (!isFilled) {
      setLinesSelection((prevLinesSelection: LinesSelection) => {
        return {
          ...prevLinesSelection,
          [lineGeometry.ID]: lineGeometry.Text,
        };
      });
      inputElRef.current && inputElRef.current.focus(); // focus on input after selecting
    }
    if (isFilled) {
      setLinesSelection((prevLinesSelection: LinesSelection) => {
        delete prevLinesSelection[lineGeometry.ID];
        return {
          ...prevLinesSelection,
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

function usePreviousLinesSelection(value: LinesSelection) {
  const ref = useRef(undefined as LinesSelection | undefined);
  useEffect(() => {
    ref.current = { ...value };
  });
  return ref.current as LinesSelection;
}

const Header = ({
  docImageDimensions,
}: {
  docImageDimensions: DocImageDimensions;
}) => {
  const { errorLine, handleSubmitAndClear, handleClear } = useContext(
    KonvaModalContext
  );
  const {
    linesSelection,
    setLinesSelection,
    inputVal,
    setInputVal,
    inputElRef,
  } = useContext(HeaderContext);
  const prevLinesSelection = usePreviousLinesSelection(
    linesSelection as LinesSelection
  );

  // handle editing by user
  const handleInputChange = (event: any) => {
    const newVal = event.target.value;
    // if a line has been edited, then deselect it automatically
    Object.entries(linesSelection)
      .filter((line) => !newVal.includes(line[1]))
      .forEach((line) => {
        setLinesSelection((prevLinesSelection: LinesSelection) => {
          delete prevLinesSelection[line[0]];
          return { ...prevLinesSelection };
        });
      });
    // set new input val
    setInputVal(newVal);
  };

  // handle line selection / deselection
  useEffect(() => {
    // make sure not undef
    if (prevLinesSelection) {
      const linesSelectionLength = Object.keys(linesSelection).length;
      const prevLinesSelectionLength = Object.keys(prevLinesSelection).length;

      // if line added, simply append
      if (prevLinesSelectionLength < linesSelectionLength) {
        const newLine = Object.entries(linesSelection).filter(
          (line) => !prevLinesSelection[line[0]]
        )[0][1];
        setInputVal((prevInputVal: string) => {
          const prevInputValArray = Array.from(prevInputVal);
          // if ends in space, don't add another
          if (prevInputValArray[prevInputValArray.length - 1] === " ") {
            return prevInputVal + newLine;
          } else {
            return prevInputVal + " " + newLine;
          }
        });
      }

      // if line subtracted, search for it, remove if find, else do nothing
      if (prevLinesSelectionLength > linesSelectionLength) {
        const oldLine = Object.entries(prevLinesSelection).filter(
          (line) => !linesSelection[line[0]]
        )[0][1];
        setInputVal((prevInputVal: string) => {
          return prevInputVal.replace(oldLine, "");
        });
      }
    }
  }, [linesSelection]);

  return (
    <HeaderWrapper
      style={{
        width: `${docImageDimensions.width}px`,
      }}
    >
      <Typography>
        <Box fontStyle="italic">
          <b>Click</b> to select a line; <b>Click</b> again to unselect; press{" "}
          <b>Enter</b> key to fill.
        </Box>
      </Typography>
      <div>
        <Typography>
          <Box fontStyle="fontWeightBold">
            <strong>Current Selection:</strong>
          </Box>
        </Typography>
        <FlexContainer>
          <CurrentSelectionWrapper>
            <StyledInput
              value={inputVal}
              onChange={handleInputChange}
              ref={inputElRef}
            />
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

const HeaderContext = createContext({} as any);

export const KonvaModal = () => {
  const {
    image,
    linesSelection,
    setLinesSelection,
    inputVal,
    setInputVal,
    currentLinesGeometry,
    docImageDimensions,
  } = useContext(KonvaModalContext);
  const setKonvaModalOpen = useStore((state) => state.setKonvaModalOpen);
  const inputElRef = useRef(null as HTMLInputElement | null);

  return (
    <>
      <StickyHeaderWrapper>
        <CloseButton onClick={() => setKonvaModalOpen(false)}>X</CloseButton>
        <HeaderContext.Provider
          value={{
            linesSelection,
            setLinesSelection,
            inputVal,
            setInputVal,
            inputElRef,
          }}
        >
          <Header docImageDimensions={docImageDimensions} />
        </HeaderContext.Provider>
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
                linesSelection,
                setLinesSelection,
                inputVal,
                setInputVal,
                inputElRef,
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
