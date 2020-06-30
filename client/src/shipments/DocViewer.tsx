import React, {
  useReducer,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import { StyledDropzone } from "./DocUploader";
import { Dropdown } from "./Dropdown";
import { getAllKeyValuePairs, getLevenDistanceAndSort } from "./KeyValuePairs";

import {
  Icon,
  Button,
  Popover,
  Menu,
  MenuItem,
  Position,
} from "@blueprintjs/core";
import $ from "jquery";
import { colors } from "./../common/colors";
import { createPopper } from "@popperjs/core";

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

const Instructions = styled.div`
  text-align: center;
  padding: 2em 2em 0em 2em;
  color: ${colors.FONT_BLUE};
`;

const Box = styled.div`
  margin: 1em 0em;
  padding: 1em;
  border: 1px solid ${colors.LAYOUT_BLUE_SOLID};
  border-radius: 5px;
  color: ${colors.FONT_BLUE};
  background-color: white;
`;
const Name = styled.h2`
  margin: 0;
`;
const Type = styled.h4`
  display: flex;
  margin: 1em 0;
`;

const RemoveButton = styled(Button)`
  top: 90%;
  left: 90%;
`;

const DeleteDialog = (props: { document: DocumentInfo }) => {
  const fileInfoContext = useContext(FileContext);

  return (
    <Menu>
      <a
        className="bp3-menu-item"
        onClick={() => {
          fileInfoContext.fileDispatch({
            type: "remove",
            documentInfo: props.document,
          });
        }}
      >
        <Icon icon={"trash"} />
        Confirm Delete
      </a>
    </Menu>
  );
};
const DeleteDialogContext = createContext({} as any);
const useDeleteDialogContext = () => {
  const context = useContext(DeleteDialogContext);
  return context;
};

const DownloadDocData = (props: { document: DocumentInfo }) => {
  const keyValuePairs: any = props.document.keyValuePairs;

  useEffect(() => {
    makeJSONDownloadable();
    makeCSVDownloadable();
  });

  const makeJSONDownloadable = () => {
    const jsonDownloadString =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(keyValuePairs));
    const jsonDownloadLink = document.querySelector(
      `#json-download-${props.document.docID}`
    );
    jsonDownloadLink?.setAttribute("href", jsonDownloadString);
    jsonDownloadLink?.setAttribute(
      "download",
      `${props.document.docName}-key-value-pairs.json`
    );
  };

  const makeCSVDownloadable = () => {
    let csv = "Key:,Value:\n";
    Object.keys(keyValuePairs).forEach((key: string) => {
      const value = keyValuePairs[key].includes(",")
        ? `"${keyValuePairs[key]}"`
        : keyValuePairs[key];
      csv += key + "," + value + "\n";
    });
    const csvDownloadString =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const csvDownloadLink = document.querySelector(
      `#csv-download-${props.document.docID}`
    );
    csvDownloadLink?.setAttribute("href", csvDownloadString);
    csvDownloadLink?.setAttribute(
      "download",
      `${props.document.docName}-key-value-pairs.csv`
    );
  };

  return (
    <Menu>
      <MenuItem
        id={`json-download-${props.document.docID}`}
        text={"Download as JSON"}
      />
      <MenuItem
        id={`csv-download-${props.document.docID}`}
        text={"Download as CSV"}
      />
    </Menu>
  );
};

const populateForms = () => {
  $(document).ready(() => {
    const keyValuePairs = getAllKeyValuePairs().docData;

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

// render input dropdowns
$(document).ready(function () {
  let dropdownIndex = 0;

  $("input").click((event: any) => {
    // create a mounter and render Dropdown
    $(`<div id="mounter${dropdownIndex}"></div>`).insertAfter(event.target);

    ReactDOM.render(
      <Dropdown dropdownIndex={dropdownIndex} eventObj={event}></Dropdown>,
      document.querySelector(`#mounter${dropdownIndex}`)
    );

    // turn dropdownElement table into instance of Popper.js
    const dropdownElement = document.querySelector(
      `#dropdown${dropdownIndex}`
    ) as HTMLElement;

    let popperInstance = createPopper(event.target, dropdownElement, {
      placement: "bottom",
    });

    // remove on mouseleave
    $(event.target).mouseleave(() => {
      // don't remove if hovering over the dropdownElement
      if ($(`#dropdown${dropdownIndex - 1}:hover`).length > 0) {
        $(dropdownElement).mouseleave(() => {
          dropdownElement.remove();
          popperInstance.destroy();
        });
      } else {
        dropdownElement.remove();
        popperInstance.destroy();
      }
    });

    dropdownIndex++;
  });
});

const DocCell = (props: DocumentInfo) => {
  return (
    <Box>
      <Name>{props.docName}</Name>
      <Type>
        <Icon icon={"rotate-document"} />
        Document Type: {props.docClass}
      </Type>
      <Type>Format: {props.docType}</Type>
      <Button onClick={populateForms}>Complete Forms on Page</Button>
      <Popover
        content={<DeleteDialog document={props} />}
        interactionKind={"click"}
      >
        <RemoveButton>
          <Icon icon={"delete"} />
        </RemoveButton>
      </Popover>
      <Popover content={<DownloadDocData document={props} />}>
        <RemoveButton>
          <Icon icon={"download"} />
        </RemoveButton>
      </Popover>
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
        {fileList.documents.map((doc: DocumentInfo, ndx: any) => {
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
