import React, { useReducer, useState, createContext, useRef } from "react";
import styled from "styled-components";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import { StyledDropzone } from "./DocUploader";
import { DocThumbsReference, getThumbsFromLocalStorage } from "./docThumbnails";

import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

import { colors, colorSwitcher } from "../common/colors";
import {
  DEFAULT_ERROR_MESSAGE,
  SIDEBAR_THUMBNAIL_WIDTH,
} from "../common/constants";
import { useStore, checkFileError } from "../contexts/ZustandStore";

import ButtonsBox from "./ButtonsBox";
import { useEffect } from "react";
import { isSpreadElement } from "typescript";

interface IDocumentList {
  documents: Array<DocumentInfo>;
}

export interface DocumentInfo {
  docType: String;
  docName: String;
  docClass: String;
  filePath: String;
  docID: String;
  keyValuePairs: Object;
}

export interface IFileDispatch {
  type: String;
  documentInfo: DocumentInfo;
}

export interface IsSelected {
  isSelected: boolean;
}

export const CountContext = createContext({} as any);
export const FileContext = createContext({} as any);

const DocCellTransitionGroup = styled.div`
  .doccell-enter {
    opacity: 0.01;
  }

  .doccell-enter.doccell-enter-active {
    opacity: 1;
    transition: opacity 500ms ease-in;
  }

  .doccell-exit {
    opacity: 1;
  }

  .doccell-exit.doccell-exit-active {
    opacity: 0.01;
    transition: opacity 300ms ease-in;
  }
`;

const Instructions = styled(Typography)`
  text-align: center;
  margin: 1em;
  color: ${colors.FONT_BLUE};
`;

const Box = styled(Card)`
  margin: 0 1em 1em 1em;
  min-height: 60px;
  border: 1px solid ${colors.DOC_CARD_BORDER};
  ${(props: IsSelected) =>
    colorSwitcher(
      props.isSelected,
      "border",
      "1px solid",
      `${colors.DROPZONE_TEXT_LIGHTGREY}`,
      `${colors.DOC_CARD_BORDER}`
    )}
`;

const DocCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${(props: IsSelected) =>
    colorSwitcher(
      props.isSelected,
      "background",
      "",
      `${colors.DOC_CARD_BACKGROUND}`,
      `${colors.SELECTED_DOC_BACKGROUND}`
    )}
`;

const ImgWrapper = styled.div`
  display: inline-block;
  height: 70px;
  width: ${SIDEBAR_THUMBNAIL_WIDTH};
  overflow: hidden;
`;

const NameAndButtonsWrapper = styled.div`
  display: inline-block;
  max-width: ${(props: { boxWidth: string | null }) =>
    props.boxWidth
      ? Number(props.boxWidth.replace("px", "")) - 50 + "px"
      : undefined};
`;

const StyledImg = styled.img`
  max-height: 100%;
  padding: 5px;
  box-sizing: border-box;
`;

const DocNameWrapper = styled.span`
  display: ${(props: { hovering: boolean }) =>
    props.hovering ? `none` : `flex`};
`;

const Type = styled(Typography)`
  margin: 1em 0.5em;
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")}
`;

const FeedbackTypography = styled(Typography)`
  margin: 0.5em auto;
  color: ${colors.DROPZONE_TEXT_GREY};
`;

const ErrorMessageWrapper = styled.div`
  margin: 0 0.5em 0.5em 0.5em;
  padding: 0.5em;
  background-color: ${colors.ERROR_BACKGROUND_RED};
`;

const ErrorMessage = ({ docID }: { docID: string }) => {
  const errorFiles = useStore((state) => state.errorFiles);
  const errorMsg = errorFiles[docID].errorMessage
    ? errorFiles[docID].errorMessage
    : DEFAULT_ERROR_MESSAGE;

  return (
    <ErrorMessageWrapper>
      <Typography variant={"body2"}>
        <i>
          <strong>Error</strong>: {errorMsg}
        </i>
      </Typography>
    </ErrorMessageWrapper>
  );
};

const DocCell = (props: DocumentInfo) => {
  const [selectedFile, setSelectedFile, errorFiles] = [
    useStore((state) => state.selectedFile),
    useStore((state) => state.setSelectedFile),
    useStore((state) => state.errorFiles),
  ];
  const errorGettingFile = checkFileError(errorFiles, props.docID.toString());
  const [hovering, setHovering] = useState(false as boolean);
  const isSelected = selectedFile === props.docID;
  const boxHeight = useRef(null as string | null);
  const boxWidth = useRef(null as string | null);
  const [docThumbnail, setDocThumbnail] = useState(
    undefined as string | undefined
  );

  // handle box click
  const setSelected = () => {
    selectedFile === props.docID
      ? setSelectedFile(null)
      : setSelectedFile(props.docID.toString()); // toString() converts 'String' wrapper type to primitive 'string' type
  };

  // set thumbnail
  useEffect(() => {
    const storedThumbs = getThumbsFromLocalStorage() as DocThumbsReference;
    const thumb = storedThumbs[props.docID.toString()] as string | undefined;
    if (thumb) {
      setDocThumbnail(thumb);
    }
  }, [props.docID]);

  return (
    <Box
      variant={isSelected ? "elevation" : "outlined"}
      onClick={setSelected}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
      ref={(docBox: HTMLElement) => {
        // get dimensions of Box, so can set dim of child elements
        if (docBox && (!boxHeight.current || !boxWidth.current)) {
          boxHeight.current = window.getComputedStyle(docBox).height;
          boxWidth.current = window.getComputedStyle(docBox).width;
        }
      }}
      isSelected={isSelected}
    >
      <DocCard isSelected={isSelected}>
        <ImgWrapper>
          <StyledImg src={docThumbnail} />
        </ImgWrapper>
        <NameAndButtonsWrapper boxWidth={boxWidth.current}>
          <DocNameWrapper hovering={hovering}>
            <Type variant="subtitle2" isSelected={isSelected}>
              {props.docName}
            </Type>
          </DocNameWrapper>
          <ButtonsBox
            docInfo={props}
            hovering={hovering}
            boxHeight={boxHeight.current}
            boxWidth={boxWidth.current}
            errorGettingFile={errorGettingFile}
            isSelected={isSelected}
          />
          {errorGettingFile && <ErrorMessage docID={props.docID.toString()} />}
        </NameAndButtonsWrapper>
      </DocCard>
    </Box>
  );
};

const InstructionsCell = () => {
  return <Instructions>Add files to get started</Instructions>;
};

const removeDocument = (docID: String) => {
  const newDocList = JSON.parse(localStorage.getItem("docList") || "[]").filter(
    (item: DocumentInfo) => item.docID !== docID
  );
  localStorage.setItem("docList", JSON.stringify(newDocList));
  return {
    documents: JSON.parse(localStorage.getItem("docList") || "[]"),
  };
};

export const fileReducer = (
  state: IDocumentList,
  action: IFileDispatch
): IDocumentList => {
  switch (action.type) {
    case "append":
      return {
        documents: [...JSON.parse(localStorage.getItem("docList") || "[]")],
      };
    case "remove":
      return removeDocument(action.documentInfo.docID);
    default:
      return state;
  }
};

/**
 * Stateful Componenet Sidebar that contains a list of the docs the user has uploaded
 * @constructor
 * @param {[DocumentInfo]} docs List of documents to show
 */

const initialState = {
  documents: JSON.parse(localStorage.getItem("docList") || "[]"),
} as IDocumentList;

const Feedback = () => {
  return (
    <FeedbackTypography>
      <i>
        <Link
          href="https://forms.gle/4XBbuJnACkbaZ5578"
          color="inherit"
          variant="body2"
          target="_blank"
          rel="noopener noreferrer"
          underline="always"
        >
          {"Provide feedback"}
        </Link>
      </i>
    </FeedbackTypography>
  );
};

const DocViewer = () => {
  const [fileList, fileDispatch] = useReducer(fileReducer, initialState);
  const [numDocs, setNumDocs] = useState(fileList.documents.length);

  return (
    <FileContext.Provider value={{ fileList, fileDispatch }}>
      <Feedback />
      {numDocs === 0 && <InstructionsCell />}
      <TransitionGroup component={DocCellTransitionGroup}>
        {fileList.documents.map((doc: DocumentInfo) => {
          return (
            <CSSTransition
              // React transition groups need a unique key that doesn't get re-indexed upon render. toString() to convert js type 'String' to ts type 'string'
              key={doc.docID.toString()}
              classNames="doccell"
              timeout={{ enter: 500, exit: 300 }}
              onEnter={() => setNumDocs(numDocs + 1)}
              onExited={() => setNumDocs(numDocs - 1)}
            >
              <DocCell
                docName={doc.docName}
                docType={doc.docType}
                filePath={doc.filePath}
                docClass={doc.docClass}
                docID={doc.docID}
                keyValuePairs={doc.keyValuePairs}
                key={doc.docID.toString()}
              />
            </CSSTransition>
          );
        })}
      </TransitionGroup>
      <StyledDropzone />
    </FileContext.Provider>
  );
};

export default DocViewer;
