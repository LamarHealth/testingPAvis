import React, {
  useReducer,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import styled from "styled-components";
import { StyledDropzone } from "./DocUploader";
import { Icon, Button, Popover, Menu } from "@blueprintjs/core";
import $ from "jquery";
import { act } from "@testing-library/react";
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
  background-color: lightgray;
  border: solid;
  display: inline-block;
  height: 100%;
  width: 25%;
  margin-left: ${(props: { open: boolean }) =>
    props.open ? "calc(-25% )" : "0.5em"};
  overflow: auto;
  padding: 0px 5px 1em;
  transition: all 1s;
`;

const ExpandButton = styled.button`
  position: relative;
  width: 2em;
  height: 3em;
  top: 50%;
  right: 1.5em;
  margin: 1em 1em 1em 1em;
  padding: 0;
  display: flex;
  justify-content: center;
`;

const Chevron = styled(Icon)`
  position: relative;
`;

/**
 * Cell containing doc info
 */
const Box = styled.div`
  margin: 1em 0em;
  padding: 5px;
  border: solid;
  background-color: white;
  overflow: auto;
`;
const Name = styled.h2``;
const Type = styled.h4`
  display: flex;
`;

const RemoveButton = styled(Button)`
  top: 90%;
  left: 90%;
`;

const DeleteDialog = (props: { setIsOpen: any; document: DocumentInfo }) => {
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
          props.setIsOpen(false);
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

const populateForms = () => {
  $(document).ready(function () {
    $("div")
      .find("input[id=text-input1]")
      .each(function (ev) {
        if (!$(this).val()) {
          $(this).attr("value", "Date: 7/5/2019");
        }
      });
  });

  $(document).ready(function () {
    $("div")
      .find("input[id=text-input2]")
      .each(function (ev) {
        if (!$(this).val()) {
          $(this).attr("value", "City/State/Zip San Jose, California 57293");
        }
      });
  });

  $(document).ready(function () {
    $("div")
      .find("input[id=text-input3]")
      .each(function (ev) {
        if (!$(this).val()) {
          $(this).attr("value", "477195");
        }
      });
  });

  $(document).ready(function () {
    $("div")
      .find("input[id=text-input4]")
      .each(function (ev) {
        if (!$(this).val()) {
          $(this).attr("value", "CID#: 13144-f-6885");
        }
      });
  });

  $(document).ready(function () {
    $("div")
      .find("input[id=text-input5]")
      .each(function (ev) {
        if (!$(this).val()) {
          $(this).attr("value", "SID# 321312-a-2131");
        }
      });
  });

  $(document).ready(function () {
    $("div")
      .find("input[id=text-input6]")
      .each(function (ev) {
        if (!$(this).val()) {
          $(this).attr("value", "FOB x");
        }
      });
  });

  $(document).ready(function () {
    $("div")
      .find("input[id=text-input7]")
      .each(function (ev) {
        if (!$(this).val()) {
          $(this).attr("value", "COD Amount: $");
        }
      });
  });

  $(document).ready(function () {
    $("div")
      .find("input[id=text-input8]")
      .each(function (ev) {
        if (!$(this).val()) {
          $(this).attr("value", "BAR CODE SPACE");
        }
      });
  });
};

const DocCell = (props: DocumentInfo) => {
  const [modalIsOpen, setIsOpen] = useState(false);
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
        isOpen={modalIsOpen}
        content={<DeleteDialog setIsOpen={setIsOpen} document={props} />}
      >
        <RemoveButton
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <Icon icon={"delete"} />
        </RemoveButton>
      </Popover>
    </Box>
  );
};

const InstructionsCell = () => {
  return (
    <Box>
      <Type>Select your files to get started </Type>
    </Box>
  );
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

  return (
    <FileContext.Provider value={{ fileList, fileDispatch }}>
      <Column open={isOpen}>
        {fileList.documents.length ? (
          fileList.documents.map((doc: DocumentInfo, ndx: any) => (
            <DocCell
              docName={doc.docName}
              docType={doc.docType}
              filePath={doc.filePath}
              docClass={doc.docClass}
              docID={doc.docID}
              keyValuePairs={doc.keyValuePairs}
              key={ndx}
            />
          ))
        ) : (
          <InstructionsCell />
        )}

        <StyledDropzone />
      </Column>
      <ExpandButton onClick={() => setOpen(!isOpen)}>
        <Chevron icon={isOpen ? "chevron-right" : "chevron-left"} />
      </ExpandButton>
    </FileContext.Provider>
  );
};

export default DocViewer;
