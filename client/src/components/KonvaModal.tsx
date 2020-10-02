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
  // Filled,
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
  const {
    // filled, setFilled,
    linesSelection,
    setLinesSelection,
    // reactEditableRef,
  } = useContext(CurrentSelectionContext);
  const isFilled = linesSelection[lineGeometry.ID] ? true : false;
  const [isMouseDown, setIsMouseDown] = useState(false as boolean);

  // console.log("filled, ", filled);
  // console.log("linesSelection, ", linesSelection);

  const fillAndSetCurrentSelection = () => {
    if (!isFilled) {
      setLinesSelection((prevLinesSelection: LinesSelection) => {
        return {
          ...prevLinesSelection,
          [lineGeometry.ID]: lineGeometry.Text,
        };
      });
      // setFilled((otherFilleds: Filled) => {
      //   return {
      //     ...otherFilleds,
      //     [lineGeometry.ID]: true,
      //   };
      // });
      // reactEditableRef.current.focus();
    }
    if (isFilled) {
      setLinesSelection((prevLinesSelection: LinesSelection) => {
        delete prevLinesSelection[lineGeometry.ID];
        return {
          ...prevLinesSelection,
          // [lineGeometry.ID]: null,
        };
      });
      // setFilled((otherFilleds: Filled) => {
      //   return {
      //     ...otherFilleds,
      //     [lineGeometry.ID]: false,
      //   };
      // });
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
  const {
    linesSelection,
    setLinesSelection,
    // reactEditableRef
  } = useContext(HeaderContext);
  // const editableDivRef = useRef(null as HTMLDivElement | null);
  // const [editedText, setEditedText] = useState(undefined as string | undefined);
  const text = useRef("");
  const [renderMe, setRenderMe] = useState(false as boolean);
  let localScopedLines = {};

  // const stringLines = Object.entries(linesSelection)
  //   .map((entry) => `<span>${entry[1] + " "}</span>`)
  //   .join("");
  // console.log(stringLines);

  useEffect(() => {
    // const linesIdsArray = Object.keys(linesSelection).map((key) => key);
    // const editedText = text.current;
    // const el = document.createElement("div");
    // el.innerHTML = editedText;
    // //@ts-ignore
    // const editedTextAsArray = [...el.getElementsByTagName("span")];
    // // console.log("editedText, ", editedText);
    // console.log("editedTextAsArray, ", editedTextAsArray);
    // const sanitizedEditedText = editedTextAsArray.filter(
    //   (span) => !linesIdsArray.includes(span.id)
    // );
    // console.log("sanitizedEditedText, ", sanitizedEditedText);

    const stringLines =
      // editedText +
      Object.entries(linesSelection)
        // .filter((entry) => !editedText.includes(entry[0]))
        .map((entry) => `<span id=${entry[0]}>${entry[1] + " "}</span>`)
        .join("");
    text.current = stringLines;
    setRenderMe(!renderMe); // seems like a hack, and it kinda is, but only because we have to use useRef instead of useState... see the react-contenteditable docs. if we could just setState, we wouldn't need to manually activate a render...
  }, [linesSelection]);

  const handleEditableChange = (event: any) => {
    console.log("event, ", event);
    if (event.type === "input") {
      const editedText = event.target.value;
      // console.log("editedText, ", editedText);
      const el = document.createElement("div");
      el.innerHTML = editedText;
      //@ts-ignore
      const editedTextAsArray = [...el.getElementsByTagName("span")];
      // console.log("editedTextAsArray, ", editedTextAsArray);
      const newLines = editedTextAsArray.map((span) => {
        return [span.id, span.innerText];
      });
      console.log("newLines, ", newLines);
      let payload = {} as any;
      newLines.forEach((line) => {
        payload[line[0]] = line[1];
      });
      // setLocalScopedLines((prevLinesSelection: LinesSelection) => {
      //   const payload = {
      //     ...prevLinesSelection,
      //   };
      //   newLines.forEach((line) => {
      //     payload[line[0]] = line[1];
      //   });
      //   console.log("payload, ", payload);
      //   return {
      //     ...payload,
      //   };
      // });
      localScopedLines = payload;
      // if (editedText === "" || editedText === "<br>") {
      //   setLinesSelection({});
      // }
      // text.current = event.target.value;
    }
  };

  const handleEditableBlur = (event: any) => {
    console.log("blur, ", event);
    setLinesSelection(localScopedLines);
  };

  // listen for changes to editable
  // useEffect(() => {
  //   if (editableDivRef.current) {
  //     const node = editableDivRef.current as Node;
  //     const config = {
  //       attributes: true,
  //       childList: true,
  //       subtree: true,
  //       characterData: true,
  //       characterDataOldValue: true,
  //     };
  //     const callback = function (
  //       mutationsList: MutationRecord[],
  //       observer: MutationObserver
  //     ) {
  //       // const editedText = editableDivRef.current?.innerText as string;
  //       // console.log("editedText, ", editedText);
  //       // for (const mutation of mutationsList) {
  //       //   if (mutation.type === "characterData") {
  //       //     // Object.entries(linesSelection).forEach((entry) => {
  //       //     //   if (!editedText.includes(entry[1].line)) {
  //       //     //     setLinesSelection((prevLinesSelection: LinesSelection) => {
  //       //     //       return {
  //       //     //         ...prevLinesSelection,
  //       //     //         [entry[0]]: {
  //       //     //           ...prevLinesSelection[entry[0]],
  //       //     //           edited: true,
  //       //     //         },
  //       //     //       };
  //       //     //     });
  //       //     //   }
  //       //     // });
  //       //   }
  //       // }
  //       let edited = false;
  //       mutationsList.forEach(
  //         (mutation) =>
  //           (mutation.type === "characterData" ||
  //             mutation.type === "childList") &&
  //           (edited = true)
  //       );
  //       if (edited) {
  //         const spanCollection = editableDivRef.current
  //           ?.children as HTMLCollection;
  //         //@ts-ignore
  //         const spanIDs = [...spanCollection] // to make an array
  //           .filter((el: any) => el.nodeName === "SPAN")
  //           .map((el) => el.id.replace("line-", ""));

  //         // console.log("spanIDs, ", spanIDs);
  //         // console.log("linesSelection, ", linesSelection);

  //         // Object.entries(linesSelection).forEach((entry) => {
  //         //   if (!spanIDs.includes(entry[0])) {
  //         //     setLinesSelection((prevLinesSelection: LinesSelection) => {
  //         //       delete prevLinesSelection[entry[0]];
  //         //       return { ...prevLinesSelection };
  //         //     });
  //         //   }
  //         // });

  //         const currentEditedText = editableDivRef.current?.innerText;

  //         // console.log(currentEditedText === "" || currentEditedText === "\n");

  //         // if (currentEditedText === "" || currentEditedText === "\n") {
  //         //   setLinesSelection({});
  //         // }

  //         // setEditedText(currentEditedText);
  //         // Object.entries(linesSelection).forEach((entry) => {
  //         //   if (!currentEditedText.includes(entry[1].line)) {
  //         //     setLinesSelection((prevLinesSelection: LinesSelection) => {
  //         //       return {
  //         //         ...prevLinesSelection,
  //         //         [entry[0]]: {
  //         //           ...prevLinesSelection[entry[0]],
  //         //           edited: true,
  //         //         },
  //         //       };
  //         //     });
  //         //   }
  //         // });
  //       }
  //     };
  //     const observer = new MutationObserver(callback);
  //     observer.observe(node, config);
  //     return () => observer.disconnect();
  //   }
  // });

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
              {/* <CurrentSelectionDiv
                contentEditable
                role={"textbox"}
                ref={editableDivRef}
              >
                {Object.entries(linesSelection).map((entry) => {
                  return <span id={`line-${entry[0]}`}>{entry[1] + " "}</span>;
                })}
              </CurrentSelectionDiv> */}
              <StyledContentEditable
                html={text.current}
                onChange={handleEditableChange}
                // innerRef={reactEditableRef}
                onBlur={handleEditableBlur}
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
    // filled,
    // setFilled,
    linesSelection,
    setLinesSelection,
    currentLinesGeometry,
    docImageDimensions,
  } = useContext(KonvaModalContext);
  const setKonvaModalOpen = useStore((state) => state.setKonvaModalOpen);
  // const reactEditableRef = useRef(null as HTMLDivElement | null);

  // console.log("KonvaModal linesSelection, ", linesSelection);

  return (
    <>
      <StickyHeaderWrapper>
        <CloseButton onClick={() => setKonvaModalOpen(false)}>X</CloseButton>
        <HeaderContext.Provider
          value={{
            linesSelection,
            setLinesSelection,
            // reactEditableRef
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
                // filled,
                // setFilled,
                linesSelection,
                setLinesSelection,
                // reactEditableRef,
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
