import React, {
  useReducer,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import styled from "styled-components";
import { StyledDropzone } from "./DocUploader";
import { Icon, Button, Popover, Menu, Position } from "@blueprintjs/core";
import $ from "jquery";
import { act } from "@testing-library/react";
import { colors } from "./../common/colors";
const Popper = require("@popperjs/core"); //throws an error w import statement
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

/**
 * Cell containing doc info
 */

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

// CCC get doc from local storage
const test = (eventObj: any) => {
  const storedDocs = JSON.parse(localStorage.getItem("docList") || "[]");
  const firstDoc = storedDocs[0];
  const firstDocData = firstDoc.keyValuePairs;

  const tableHead = `<tr><th>Field Name</th><th>Field Value</th></tr>`;

  const tableRows = Object.keys(firstDocData).map((key) => {
    let clickHandler = () => console.log("hello");
    return `<tr><td>${key}</td><td>${firstDocData[key]}</td><td><button onClick={console.log('hello')}>Fill</button></td></tr>`;
  });

  return `<table>${tableHead}${tableRows}</table>`;
};

// CCC input dropdowns

$(document).ready(function () {
  let tooltipIndex = 0;

  $("input").click((event: any) => {
    if (
      !event.target.nextElementSibling ||
      !event.target.nextElementSibling.id.includes("tooltip")
    ) {
      $(
        `<div id='tooltip${tooltipIndex}' class='tooltip' role='tooltip'>${test(
          event
        )}</div>`
      ).insertAfter(event.target);

      const tooltip = document.querySelector(
        `#tooltip${tooltipIndex}`
      ) as HTMLElement;

      let popperInstance = Popper.createPopper(event.target, tooltip, {
        placement: "bottom",
      });

      // need to fix this, bug here
      $(tooltip).mouseover(() => {
        $(tooltip).mouseleave(() => {
          tooltip.style.display = "none";
          popperInstance.destroy();
        });
      });

      tooltipIndex++;
    } else {
      if (
        event.target.nextElementSibling &&
        event.target.nextElementSibling.id.includes("tooltip")
      ) {
        const tooltip = event.target.nextElementSibling as HTMLElement;

        let popperInstance = Popper.createPopper(event.target, tooltip, {
          placement: "bottom",
        });

        tooltip.style.display = "block";
      }
    }
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
      <ExpandButton onClick={() => setOpen(!isOpen)} open={isOpen}>
        <Chevron icon={isOpen ? "chevron-right" : "chevron-left"} />
      </ExpandButton>
    </FileContext.Provider>
  );
};

export default DocViewer;
