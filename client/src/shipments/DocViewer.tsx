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
import {
  getLevenDistanceAndSort,
  getKeyValuePairsByDoc,
} from "./KeyValuePairs";
import useGlobalSelectedFile from "../hooks/GlobalSelectedFileHook";

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

/**
 * Sidebar column container
 */
const Column = styled.div`
  justify-content: flex-start;
  flex-direction: column;
  align-items: stretch;
  margin: 1em 0em;
  border: ${(props: { open: boolean }) =>
    props.open
      ? `1px solid ${colors.LAYOUT_BLUE_CLEAR}`
      : `1px solid ${colors.LAYOUT_BLUE_SOLID}`};
  border-radius: 10px;
  display: inline-block;
  height: 100%;
  width: 25%;
  margin-left: ${(props: { open: boolean }) =>
    props.open ? "calc(-25% )" : "0.5em"};
  overflow: auto;
  transition: all 1s;
`;

const ExpandButton = styled.button`
  position: relative;
  width: 2em;
  height: 3em;
  top: 50%;
  right: 1em;
  margin: 1em 1em 1em 1em;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.LAYOUT_BLUE_SOLID};
  color: white;
  opacity: ${(props: { open: boolean }) => (props.open ? 0.4 : 1)};
  transition: 0.5s;
  border: none;
  border-radius: 0% 25% 25% 0%;

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: none;
  }
`;

const Chevron = styled(Icon)`
  position: relative;
`;

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
  margin: 1em;
  padding: 1em;
  border: 1px solid ${colors.LAYOUT_BLUE_SOLID};
  border-radius: 5px;
  color: ${colors.FONT_BLUE};
  background-color: white;
  overflow: auto;
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
  const setGlobalSelectedFile = useGlobalSelectedFile()[1];

  const handleDelete = (e: any) => {
    e.stopPropagation();
    setGlobalSelectedFile({ selectedFile: "" });
    fileInfoContext.fileDispatch({
      type: "remove",
      documentInfo: props.document,
    });
  };

  return (
    <Menu>
      <a className="bp3-menu-item" onClick={handleDelete}>
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
      placement: "bottom",
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

const DocCell = (props: DocumentInfo) => {
  const [globalSelectedFile, setGlobalSelectedFile] = useGlobalSelectedFile();

  const populateForms = () => {
    $(document).ready(() => {
      const keyValuePairs = getKeyValuePairsByDoc().filter(
        (doc) => doc.docName === props.docName
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
    <Box
      onClick={() => setGlobalSelectedFile({ selectedFile: props.docName })}
      style={
        globalSelectedFile.selectedFile === props.docName
          ? { backgroundColor: colors.DROPZONE_BACKGROUND_HOVER_LIGHTBLUE }
          : { backgroundColor: "" }
      }
    >
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
  const [isOpen, setOpen] = useState(true);
  const [numDocs, setNumDocs] = useState(fileList.documents.length);

  return (
    <FileContext.Provider value={{ fileList, fileDispatch }}>
      <Column open={isOpen}>
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
      </Column>
      <ExpandButton onClick={() => setOpen(!isOpen)} open={isOpen}>
        <Chevron icon={isOpen ? "chevron-right" : "chevron-left"} />
      </ExpandButton>
    </FileContext.Provider>
  );
};

export default DocViewer;
