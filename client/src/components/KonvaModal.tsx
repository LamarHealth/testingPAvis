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
  const { linesSelection, setLinesSelection } = useContext(
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

const Header = ({
  docImageDimensions,
}: {
  docImageDimensions: DocImageDimensions;
}) => {
  const { errorLine, handleSubmitAndClear, handleClear } = useContext(
    KonvaModalContext
  );
  const { linesSelection, setLinesSelection } = useContext(HeaderContext);
  const [eventTarget, autocompleteAnchor] = [
    useStore((state) => state.eventTarget),
    useStore((state) => state.autocompleteAnchor),
  ];
  const text = useRef("");
  const [renderMe, setRenderMe] = useState(false as boolean);
  const editableRef = useRef(null as HTMLElement | null);
  let localScopedLines = linesSelection;

  useEffect(() => {
    const stringLines = Object.entries(linesSelection)
      .map((entry) => `<span id=${entry[0]}>${entry[1] + " "}</span>`)
      .join("");
    text.current = stringLines;
    setRenderMe(!renderMe); // seems like a hack, and it kinda is, but only because we have to use useRef instead of useState... see the react-contenteditable docs. if we could just setState, we wouldn't need to manually activate a render...
  }, [linesSelection]);

  const handleEditableChange = (event: any) => {
    console.log("event, ", event);
    if (event.type === "input") {
      const el = document.createElement("div");
      el.innerHTML = event.target.value;
      //@ts-ignore
      const editedTextAsArray = [...el.getElementsByTagName("span")];
      const newLines = editedTextAsArray.map((span) => {
        return [span.id, span.innerText];
      });

      let payload = {} as any;
      newLines.forEach((line) => {
        payload[line[0]] = line[1];
      });
      localScopedLines = payload;
    }
  };

  const handleEditableBlur = (event: any) => {
    setLinesSelection(localScopedLines);
  };

  useEffect(() => {
    function keydownListener(e: any) {
      if (e.keyCode === 13) {
        if (!autocompleteAnchor) {
          // don't fire if autocomplete is open
          handleSubmitAndClear();
        }
      }
    }
    document.addEventListener("keydown", keydownListener);
    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [eventTarget, autocompleteAnchor]);

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
            <CurrentSelectionWrapper>
              <StyledContentEditable
                html={text.current}
                onChange={handleEditableChange}
                onBlur={handleEditableBlur}
                innerRef={editableRef}
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

const HeaderContext = createContext({} as any);

export const KonvaModal = () => {
  const {
    image,
    linesSelection,
    setLinesSelection,
    currentLinesGeometry,
    docImageDimensions,
  } = useContext(KonvaModalContext);
  const setKonvaModalOpen = useStore((state) => state.setKonvaModalOpen);

  return (
    <>
      <StickyHeaderWrapper>
        <CloseButton onClick={() => setKonvaModalOpen(false)}>X</CloseButton>
        <HeaderContext.Provider
          value={{
            linesSelection,
            setLinesSelection,
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
