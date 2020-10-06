import React, { useReducer, useState, createContext } from "react";
import styled from "styled-components";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import { StyledDropzone } from "./DocUploader";

import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { green } from "@material-ui/core/colors";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

import { colors } from "../common/colors";
import { useStore } from "../contexts/ZustandStore";

import ButtonsBox from "./ButtonsBox";

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
`;

const DocCard = styled.div``;

const Type = styled(Typography)`
  display: flex;
  margin: 1em 0.5em;
`;

const TypeWrapper = styled.span`
  display: ${(props: { hovering: boolean; isSelected: boolean }) =>
    props.hovering ? `none` : `inherit`};
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

  const setSelected = () => {
    selectedFile === props.docID
      ? setSelectedFile(null)
      : setSelectedFile(props.docID.toString()); // toString() converts 'String' wrapper type to primitive 'string' type
  };

  return (
    <Box
      onClick={setSelected}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
      style={
        isSelected
          ? { backgroundColor: `${colors.DROPZONE_BACKGROUND_HOVER_LIGHTBLUE}` }
          : { backgroundColor: "transparent" }
      }
    >
      <DocCard id="doc-card">
        <TypeWrapper hovering={hovering} isSelected={isSelected}>
          <Type variant="subtitle2">{props.docName}</Type>
        </TypeWrapper>
        <ButtonsBox
          docInfo={props}
          hovering={hovering}
          isSelected={isSelected}
        />
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
