import React, { useReducer, useState, createContext } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import { StyledDropzone } from "./DocUploader";
import { Dropdown } from "./Dropdown";
import {
  getLevenDistanceAndSort,
  getKeyValuePairsByDoc,
} from "./KeyValuePairs";

import Chip from "@material-ui/core/Chip";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { green } from "@material-ui/core/colors";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import $ from "jquery";
import { colors } from "./../common/colors";
import { createPopper } from "@popperjs/core";
import {
  createState as createSpecialHookState,
  useState as useSpecialHookState,
} from "@hookstate/core";

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
`;

const Type = styled(Typography)`
  display: flex;
  margin: 1em 0;
`;

// render input dropdowns
$(document).ready(function () {
  let dropdownIndex = 0;

  $("input").click((event: any) => {
    // create a mounter and render Dropdown
    const mounter = $(`<div id="mounter${dropdownIndex}"></div>`).insertAfter(
      event.target
    );

    ReactDOM.render(
      <Dropdown dropdownIndex={dropdownIndex} eventObj={event}></Dropdown>,
      document.querySelector(`#mounter${dropdownIndex}`)
    );

    // turn dropdownElement table into instance of Popper.js
    const dropdownElement = document.querySelector(
      `#dropdown${dropdownIndex}`
    ) as HTMLElement;

    let popperInstance = createPopper(event.target, dropdownElement, {
      placement: "bottom-start",
    });

    // remove on mouseleave
    $(event.target).mouseleave(() => {
      // don't remove if hovering over the dropdownElement
      if ($(`#dropdown${dropdownIndex - 1}:hover`).length > 0) {
        $(dropdownElement).mouseleave(() => {
          dropdownElement.remove();
          mounter.remove();
          popperInstance.destroy();
        });
      } else {
        dropdownElement.remove();
        mounter.remove();
        popperInstance.destroy();
      }
    });

    dropdownIndex++;
  });
});

export const globalSelectedFileState = createSpecialHookState("");

const DocCell = (props: DocumentInfo) => {
  const globalSelectedFile = useSpecialHookState(globalSelectedFileState);

  const populateForms = () => {
    $(document).ready(() => {
      const keyValuePairs = getKeyValuePairsByDoc().filter(
        (doc) => doc.docID === props.docID
      )[0];

      $("input").each(function () {
        const targetString = $(this).attr("placeholder");

        if (typeof targetString === "undefined") {
          return;
        }

        const sortedKeyValuePairs = getLevenDistanceAndSort(
          keyValuePairs,
          targetString
        );

        $(this).attr("value", sortedKeyValuePairs[0]["value"]);
      });
    });
  };

  return (
    <Box onClick={() => globalSelectedFile.set(`${props.docID}`)}>
      <CardContent>
        {globalSelectedFile.get() === props.docID ? (
          <Type
            variant="subtitle1"
            style={{
              backgroundColor: `${colors.DROPZONE_BACKGROUND_HOVER_LIGHTBLUE}`,
            }}
          >
            <CheckCircleIcon style={{ color: green[500] }} />
            {props.docName}
          </Type>
        ) : (
          <Type variant="subtitle1">{props.docName}</Type>
        )}

        <Type>
          <FileCopyOutlinedIcon />
          Format: {props.docType}
        </Type>
        <Chip
          label="Complete Forms on Page"
          onClick={populateForms}
          variant="outlined"
          style={{ marginRight: "0.5em" }}
        />
        <ButtonsBox docInfo={props} />
      </CardContent>
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
              // React transition groups need a unique key that doesn't get re-indexed upon render. Template literals to convert js type 'String' to ts type 'string'
              key={`${doc.docID}`}
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
                key={`${doc.docID}`}
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
