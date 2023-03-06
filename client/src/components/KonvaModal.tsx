import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";
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
  LinesSelectionActionTypes,
  InputValActionTypes,
} from "./ManualSelect";
import { DocImageDimensions } from "./RenderModal";

interface KonvaModalProps {
  isInNewTab?: boolean;
}

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
  background-color: ${colors.WHITE};
  border-bottom: 1px solid ${colors.KVP_TABLE_BORDER};
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

interface CurrentSelectionProps {
  inputElRef: React.RefObject<HTMLInputElement>;
  linesSelection: LinesSelection;
  inputVal: string;
  linesSelectionDispatch: React.Dispatch<{
    type: LinesSelectionActionTypes;
    line: { [key: string]: string };
  }>;
  inputValDispatch: React.Dispatch<{
    type: InputValActionTypes;
    val: string;
  }>;
}

export const CurrentSelectionContext = createContext(
  {} as CurrentSelectionProps
);

const Polygon = ({
  lineGeometry,
  docImageDimensions,
}: {
  lineGeometry: LinesGeometry;
  docImageDimensions: DocImageDimensions;
}) => {
  const [color, setColor] = useState("transparent");
  const [isFilled, setIsFilled] = useState(false as boolean);
  const { inputElRef, linesSelection, linesSelectionDispatch } = useContext(
    CurrentSelectionContext
  );

  // useEffect for filled logic
  useEffect(() => {
    console.log("In the useeffect hook");
    // const shouldFill = linesSelection[lineGeometry.ID] ? true : false;

    console.log(Object.values(linesSelection)[0]);
    const shouldFill = Object.values(linesSelection)[0] === lineGeometry.Text;

    shouldFill && console.log("!!!!!!", linesSelection, lineGeometry);
    shouldFill && setColor(colors.MANUAL_SELECT_RECT_FILL_YELLOW);
    setIsFilled(linesSelection[lineGeometry.ID] ? true : false);
  }, [linesSelection]);

  const [isMouseDown, setIsMouseDown] = useState(false as boolean);

  const fillAndSetCurrentSelection = () => {
    const line = { [lineGeometry.ID]: lineGeometry.Text };
    if (!isFilled) {
      linesSelectionDispatch({ type: LinesSelectionActionTypes.select, line });
      inputElRef.current && inputElRef.current.focus(); // focus on input after selecting
    }
    if (isFilled) {
      linesSelectionDispatch({
        type: LinesSelectionActionTypes.deselect,
        line,
      });
    }
  };

  return (
    <Line
      onClick={fillAndSetCurrentSelection}
      onMouseEnter={() => {
        setColor(colors.MANUAL_SELECT_RECT_HOVER);
      }}
      onMouseLeave={() => {
        setColor("transparent");
        setIsMouseDown(false);
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

const findMissingLine = (
  linesSelectionToCheck: LinesSelection,
  linesSelectionToCheckAgainst: LinesSelection
) => {
  return Object.entries(linesSelectionToCheck).filter(
    (line) => !linesSelectionToCheckAgainst[line[0]]
  )[0][1];
};

const usePreviousLinesSelection = (value: LinesSelection) => {
  const ref = useRef(undefined as LinesSelection | undefined);
  useEffect(() => {
    ref.current = { ...value };
  });
  return ref.current as LinesSelection;
};

const Header = ({
  docImageDimensions,
}: {
  docImageDimensions: DocImageDimensions;
}) => {
  const { errorLine, handleSubmitAndClear, handleClear } =
    useContext(KonvaModalContext);
  const {
    inputElRef,
    linesSelection,
    linesSelectionDispatch,
    inputVal,
    inputValDispatch,
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
        linesSelectionDispatch({
          type: LinesSelectionActionTypes.deselect,
          line: { [line[0]]: line[1] },
        });
      });
    // set new input val
    inputValDispatch({ type: InputValActionTypes.replace, value: newVal });
  };

  // handle line selection / deselection
  const updateInputValOnLineClick = useCallback(() => {
    // make sure not undef
    if (prevLinesSelection) {
      const linesSelectionLength = Object.keys(linesSelection).length;
      const prevLinesSelectionLength = Object.keys(prevLinesSelection).length;

      // if line added, simply append
      if (prevLinesSelectionLength < linesSelectionLength) {
        const newLine = findMissingLine(linesSelection, prevLinesSelection);
        inputValDispatch({
          type: InputValActionTypes.appendLine,
          value: newLine,
        });
      }

      // if line subtracted, search for it, remove if find, else do nothing
      if (prevLinesSelectionLength > linesSelectionLength) {
        const oldLine = findMissingLine(prevLinesSelection, linesSelection);
        inputValDispatch({
          type: InputValActionTypes.removeLine,
          value: oldLine,
        });
      }
    }
  }, [linesSelection, prevLinesSelection, inputValDispatch]);

  useEffect(() => {
    updateInputValOnLineClick();
  }, [updateInputValOnLineClick]);

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
              className={"docit-no-drag"}
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

export const KonvaModal = (props: KonvaModalProps) => {
  const {
    image,
    currentLinesGeometry,
    docImageDimensions,
    linesSelection,
    linesSelectionDispatch,
    inputVal,
    inputValDispatch,
  } = useContext(KonvaModalContext);
  const [setKonvaModalOpen, selectedLine] = [
    useStore((state) => state.setKonvaModalOpen),
    useStore((state) => state.selectedLine),
  ];
  const inputElRef = useRef(null as HTMLInputElement | null);

  // if selectedLine is not null, then replace lineSelection with selectedLine
  useEffect(() => {
    console.log(
      "in the use effect in KonvaModal. Detected a change to ",
      selectedLine
    );
    if (selectedLine) {
      console.log("Dispatching");
      linesSelectionDispatch({
        type: LinesSelectionActionTypes.select,
        line: selectedLine,
      });
    }
  }, [selectedLine, linesSelectionDispatch]);

  return (
    <>
      <StickyHeaderWrapper>
        {!props.isInNewTab && (
          <CloseButton onClick={() => setKonvaModalOpen(false)}>X</CloseButton>
        )}
        <HeaderContext.Provider
          value={{
            inputElRef,
            linesSelection,
            linesSelectionDispatch,
            inputVal,
            inputValDispatch,
          }}
        >
          <Header docImageDimensions={docImageDimensions} />
        </HeaderContext.Provider>
      </StickyHeaderWrapper>
      <CursorPointerWrapper className={"docit-no-drag"}>
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
                inputElRef,
                linesSelection,
                linesSelectionDispatch,
                inputVal,
                inputValDispatch,
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
