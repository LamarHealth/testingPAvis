import React, { useReducer, useState, createContext, useRef } from "react";
import styled from "styled-components";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import { StyledDropzone } from "./DocUploader";
import { DocThumbsReference } from "./docThumbnails";

import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

import { colors } from "../common/colors";
import { useStore } from "../contexts/ZustandStore";

import ButtonsBox from "./ButtonsBox";
import { useEffect } from "react";

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
  padding: 2em 2em 0em 2em;
  color: ${colors.FONT_BLUE};
`;

const Box = styled(Card)`
  margin: 1em;
  min-height: 60px;
  border: 1px solid ${colors.DOC_CARD_BORDER};
`;

const DocCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ImgWrapper = styled.div`
  display: inline-block;
  height: 70px;
  width: 50px;
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
  filter: ${(props: { blur: boolean }) => (props.blur ? "blur(1px)" : 0)};
`;

const DocNameWrapper = styled.span`
  display: ${(props: { hovering: boolean }) =>
    props.hovering ? `none` : `flex`};
`;

const Type = styled(Typography)`
  margin: 1em 0.5em;
`;

const FeedbackTypography = styled(Typography)`
  margin: 0.5em auto;
  color: ${colors.DROPZONE_TEXT_GREY};
`;

const DocCell = (props: DocumentInfo) => {
  const [selectedFile, setSelectedFile] = [
    useStore((state) => state.selectedFile),
    useStore((state) => state.setSelectedFile),
  ];
  const [hovering, setHovering] = useState(false as boolean);
  const isSelected = selectedFile === props.docID;
  const boxHeight = useRef(null as string | null);
  const boxWidth = useRef(null as string | null);
  const [docThumbnail, setDocThumbnail] = useState(
    undefined as string | undefined
  );

  const setSelected = () => {
    selectedFile === props.docID
      ? setSelectedFile(null)
      : setSelectedFile(props.docID.toString()); // toString() converts 'String' wrapper type to primitive 'string' type
  };

  useEffect(() => {
    const thumb = (JSON.parse(
      localStorage.getItem("docThumbnails") || "{}"
    ) as DocThumbsReference)[props.docID.toString()] as string | undefined;
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
      // TYPE THIS
      ref={(docBox: any) => {
        // set height of Box, so that height is the max of the child elements. so that height isn't changing while hovering
        if (docBox && (!boxHeight.current || !boxWidth.current)) {
          boxHeight.current = window.getComputedStyle(docBox).height;
          boxWidth.current = window.getComputedStyle(docBox).width;
        }
      }}
    >
      <div
        style={
          isSelected
            ? { background: `${colors.SELECTED_DOC_BACKGROUND}` }
            : { background: `${colors.DOC_CARD_BACKGROUND}` }
        }
      >
        <DocCard>
          <ImgWrapper>
            <StyledImg src={docThumbnail} blur={!isSelected} />
          </ImgWrapper>
          <NameAndButtonsWrapper boxWidth={boxWidth.current}>
            <DocNameWrapper hovering={hovering}>
              <Type variant="subtitle2">{props.docName}</Type>
            </DocNameWrapper>
            <ButtonsBox
              docInfo={props}
              hovering={hovering}
              isSelected={isSelected}
              boxHeight={boxHeight.current}
              boxWidth={boxWidth.current}
            />
          </NameAndButtonsWrapper>
        </DocCard>
      </div>
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
      <Feedback />
    </FileContext.Provider>
  );
};

export default DocViewer;
