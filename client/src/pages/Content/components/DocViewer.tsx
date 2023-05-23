// Sidebar component
import React, { useState, createContext, useEffect } from "react";
import styled from "styled-components";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import { StyledDropzone } from "./DocUploader";
import { getThumbsFromLocalStorage } from "./docThumbnails";

import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { getDocListFromLocalStorage } from "./docList";

import {
  populateBlankChicklets,
  removeAllChiclets,
} from "./ScoreChiclet/functions";
import { colors, colorSwitcher } from "../common/colors";
import {
  DEFAULT_ERROR_MESSAGE,
  DOC_CARD_THUMBNAIL_WIDTH,
  DOC_CARD_HEIGHT,
} from "../common/constants";
import {
  useStore,
  useSelectedDocumentStore,
  SelectedDocumentStoreState,
  checkFileError,
  State,
} from "../contexts/ZustandStore";
import ButtonsBox from "./ButtonsBox";
import { DocumentInfo } from "../../../types/documents";

export interface IFileDispatch {
  type: string;
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

const FeedbackTypography = styled(Typography)`
  float: right;
  margin: 0.5em 1em;
  color: ${colors.DROPZONE_TEXT_GREY};
`;

const ErrorMessageWrapper = styled.div`
  margin: 0 0.5em 0.5em 0.5em;
  padding: 0.5em;
  background-color: ${colors.ERROR_BACKGROUND_RED};
`;

const Box = styled(Card)`
  margin: 0 1em 1em 1em;
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
  height: ${DOC_CARD_HEIGHT};
  width: ${DOC_CARD_THUMBNAIL_WIDTH};
  overflow: hidden;
  flex-shrink: 0;
`;

const StyledImg = styled.img`
  max-height: 100%;
  padding: 5px;
  box-sizing: border-box;
`;

const NameAndButtonsWrapper = styled.div`
  display: inline-block;
  width: 100%;
`;

const DocNameWrapper = styled.span`
  display: ${(props: { hovering: boolean }) =>
    props.hovering ? "none" : "flex"};
  max-height: ${DOC_CARD_HEIGHT};
  overflow: hidden;
`;

const Type = styled(Typography)`
  margin: 1em 0.5em;
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")}
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  float: left;
  margin: 0.5em 1em;
  ${(props: IsSelected) => colorSwitcher(props.isSelected, "color")}
`;

const StyledCheckbox = styled(Checkbox)`
  color: ${colors.DROPZONE_TEXT_GREY};
`;

const ErrorMessage = ({ docID }: { docID: string }) => {
  const errorFiles = useStore((state: State) => state.errorFiles);
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
  const [setSelectedFile, errorFiles] = [
    useStore((state: State) => state.setSelectedFile),
    useStore((state: State) => state.errorFiles),
  ];

  const [selectedDocument, setSelectedDocument] = [
    useSelectedDocumentStore(
      (state: SelectedDocumentStoreState) => state.selectedDocument
    ),
    useSelectedDocumentStore(
      (state: SelectedDocumentStoreState) => state.setSelectedDocument
    ),
  ];

  const errorGettingFile = checkFileError(errorFiles, props.docID);
  const [hovering, setHovering] = useState(false as boolean);
  const isSelected = selectedDocument?.docID === props.docID;
  const [docThumbnail, setDocThumbnail] = useState(
    undefined as string | undefined
  );

  // Handle click to select doc in global store
  // Used to deterimine which PDF to open in PDF viewer and which doc to show in chiclets
  const setSelected = () => {
    selectedDocument?.docID === props.docID
      ? setSelectedFile(null)
      : setSelectedFile(props.docID);

    getDocListFromLocalStorage()
      .then((docList) => {
        const doc = docList.find((doc) => doc.docID === props.docID);
        setSelectedDocument(doc || null);
      })
      .catch((err) => {
        console.warn("Error retrieving documents", err);
      });
  };

  const handleBoxClick = () => {
    // Sets global selected doc
    setSelected();

    // Toggle chiclets
    isSelected ? removeAllChiclets() : populateBlankChicklets();
  };

  // set thumbnail
  useEffect(() => {
    // TODO: Refactor this code so thumbnail is passed in as a prop
    getThumbsFromLocalStorage((thumbnails) => {
      const thumb = thumbnails[props.docID];
      if (thumb) {
        setDocThumbnail(thumb);
      }
    });
  }, [props.docID]);

  return (
    <Box
      variant={isSelected ? "elevation" : "outlined"}
      onClick={handleBoxClick}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
      isSelected={isSelected}
    >
      <DocCard isSelected={isSelected}>
        <ImgWrapper>
          <StyledImg src={docThumbnail} />
        </ImgWrapper>
        <NameAndButtonsWrapper>
          <DocNameWrapper hovering={hovering}>
            <Type variant="subtitle2" isSelected={isSelected}>
              {props.docName}
            </Type>
          </DocNameWrapper>
          <ButtonsBox
            docInfo={props}
            hovering={hovering}
            errorGettingFile={errorGettingFile}
            isSelected={isSelected}
          />
          {errorGettingFile && <ErrorMessage docID={props.docID} />}
        </NameAndButtonsWrapper>
      </DocCard>
    </Box>
  );
};

const InstructionsCell = () => {
  return <Instructions>Add files to get started</Instructions>;
};

/**
 * Stateful Componenet Sidebar that contains a list of the docs the user has uploaded
 * @constructor
 * @param {[DocumentInfo]} docs List of documents to show
 */

const Feedback = () => {
  return (
    <FeedbackTypography>
      <i>
        <Link
          href="https://bit.ly/speedify-feedback"
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
  const [fileList, setFileList] = useState([] as DocumentInfo[]);
  const [numDocs, setNumDocs] = useState(fileList.length);
  const [openDocInNewTab, setOpenDocInNewTab] = [
    useStore((state: State) => state.openDocInNewTab),
    useStore((state: State) => state.setOpenDocInNewTab),
  ];

  // set fileList initially
  useEffect(() => {
    getDocListFromLocalStorage().then((storedDocs) => {
      setFileList(storedDocs);
    });
  }, []);

  return (
    <FileContext.Provider value={{ fileList, setFileList }}>
      <div>
        <StyledFormControlLabel
          value="newTab"
          control={<StyledCheckbox />}
          label="Open PDF in new tab"
          checked={openDocInNewTab}
          onClick={() => setOpenDocInNewTab(!openDocInNewTab)}
          isSelected={openDocInNewTab}
        />
        <Feedback />
      </div>
      {numDocs === 0 && <InstructionsCell />}
      {!!fileList.length && (
        <TransitionGroup component={DocCellTransitionGroup}>
          {fileList.map((doc: DocumentInfo) => {
            return (
              <CSSTransition
                // React transition groups need a unique key that doesn't get re-indexed upon render. toString() to convert js type 'String' to ts type 'string'
                key={doc.docID}
                classNames="doccell"
                timeout={{ enter: 500, exit: 300 }}
                onEnter={() => setNumDocs(numDocs + 1)}
                onExited={() => setNumDocs(numDocs - 1)}
              >
                <DocCell
                  docName={doc.docName}
                  docType={doc.docType}
                  docID={doc.docID}
                  keyValuePairs={doc.keyValuePairs}
                  lines={doc.lines}
                  key={doc.docID}
                  pdf={doc.pdf}
                />
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      )}
      <StyledDropzone />
    </FileContext.Provider>
  );
};

export default DocViewer;
