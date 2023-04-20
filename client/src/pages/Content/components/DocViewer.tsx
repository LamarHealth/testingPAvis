import React, { useReducer, useState, createContext } from 'react';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { StyledDropzone } from './DocUploader';
import { getThumbsFromLocalStorage } from './docThumbnails';

import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import {
  populateBlankChicklets,
  removeAllChiclets,
} from './ScoreChiclet/functions';
import { colors, colorSwitcher } from '../common/colors';
import {
  DEFAULT_ERROR_MESSAGE,
  DOC_CARD_THUMBNAIL_WIDTH,
  DOC_CARD_HEIGHT,
} from '../common/constants';
import { useStore, checkFileError } from '../contexts/ZustandStore';

import ButtonsBox from './ButtonsBox';
import { useEffect } from 'react';

interface IDocumentList {
  documents: Array<DocumentInfo>;
}

export interface DocumentInfo {
  docType: string;
  docName: string;
  docClass: string;
  filePath: string;
  docID: string;
  keyValuePairs: Object;
}

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
      'border',
      '1px solid',
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
      'background',
      '',
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
    props.hovering ? 'none' : 'flex'};
  max-height: ${DOC_CARD_HEIGHT};
  overflow: hidden;
`;

const Type = styled(Typography)`
  margin: 1em 0.5em;
  ${(props: IsSelected) => colorSwitcher(props.isSelected, 'color')}
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  float: left;
  margin: 0.5em 1em;
  ${(props: IsSelected) => colorSwitcher(props.isSelected, 'color')}
`;

const StyledCheckbox = styled(Checkbox)`
  color: ${colors.DROPZONE_TEXT_GREY};
`;

const ErrorMessage = ({ docID }: { docID: string }) => {
  const errorFiles = useStore((state: any) => state.errorFiles);
  const errorMsg = errorFiles[docID].errorMessage
    ? errorFiles[docID].errorMessage
    : DEFAULT_ERROR_MESSAGE;

  return (
    <ErrorMessageWrapper>
      <Typography variant={'body2'}>
        <i>
          <strong>Error</strong>: {errorMsg}
        </i>
      </Typography>
    </ErrorMessageWrapper>
  );
};

const DocCell = (props: DocumentInfo) => {
  const [selectedFile, setSelectedFile, errorFiles] = [
    useStore((state: any) => state.selectedFile),
    useStore((state: any) => state.setSelectedFile),
    useStore((state: any) => state.errorFiles),
  ];
  const errorGettingFile = checkFileError(errorFiles, props.docID);
  const [hovering, setHovering] = useState(false as boolean);
  const isSelected = selectedFile === props.docID;
  const [docThumbnail, setDocThumbnail] = useState(
    undefined as string | undefined
  );

  // handle click to select doc
  const setSelected = () => {
    selectedFile === props.docID
      ? setSelectedFile(null)
      : setSelectedFile(props.docID);
  };

  const handleBoxClick = () => {
    setSelected();
    isSelected ? removeAllChiclets() : populateBlankChicklets();
  };

  // set thumbnail
  useEffect(() => {
    getThumbsFromLocalStorage((thumbnails) => {
      const thumb = thumbnails[props.docID];
      if (thumb) {
        setDocThumbnail(thumb);
      }
    });
  }, [props.docID]);

  return (
    <Box
      variant={isSelected ? 'elevation' : 'outlined'}
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

const removeDocument = (docID: string) => {
  const newDocList = JSON.parse(localStorage.getItem('docList') || '[]').filter(
    (item: DocumentInfo) => item.docID !== docID
  );
  localStorage.setItem('docList', JSON.stringify(newDocList));
  return {
    documents: JSON.parse(localStorage.getItem('docList') || '[]'),
  };
};

export const fileReducer = (
  state: IDocumentList,
  action: IFileDispatch
): IDocumentList => {
  switch (action.type) {
    case 'append':
      return {
        documents: [...JSON.parse(localStorage.getItem('docList') || '[]')],
      };
    case 'remove':
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
  documents: JSON.parse(localStorage.getItem('docList') || '[]'),
} as IDocumentList;

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
          {'Provide feedback'}
        </Link>
      </i>
    </FeedbackTypography>
  );
};

const DocViewer = () => {
  const [fileList, fileDispatch] = useReducer(fileReducer, initialState);
  const [numDocs, setNumDocs] = useState(fileList.documents.length);
  const [openDocInNewTab, setOpenDocInNewTab] = [
    useStore((state: any) => state.openDocInNewTab),
    useStore((state: any) => state.setOpenDocInNewTab),
  ];

  return (
    <FileContext.Provider value={{ fileList, fileDispatch }}>
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
      <TransitionGroup component={DocCellTransitionGroup}>
        {fileList.documents.map((doc: DocumentInfo) => {
          console.log('doc', doc);
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
                filePath={doc.filePath}
                docClass={doc.docClass}
                docID={doc.docID}
                keyValuePairs={doc.keyValuePairs}
                key={doc.docID}
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
