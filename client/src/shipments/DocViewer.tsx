import React, { useReducer, createContext } from "react";
import styled from "styled-components";
import { StyledDropzone } from "./DocUploader";

interface IDocumentList {
  documents: Array<DocumentInfo>;
}

export interface DocumentInfo {
  docType: String;
  docName: String;
  filePath: String;
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
  margin: 2em;
  background-color: lightgray;
  border: solid;
  display: inline-block;
  height: 100%;
  width: 25%;
  overflow: auto;
  padding: 0px 5px 1em;
`;

/**
 * Cell containing doc info
 */
const Box = styled.div`
  margin: 1em 0em;
  padding: 5px;
  border: solid;
  background-color: white;
`;
const Name = styled.h1``;
const Type = styled.h3``;

class DocCell extends React.PureComponent<DocumentInfo> {
  render() {
    return (
      <Box>
        <Name>{this.props.docName}</Name>
        <Type>{this.props.docType}</Type>
      </Box>
    );
  }
}

const InstructionsCell = () => {
  return (
    <Box>
      <Type>Select your files to get started </Type>
    </Box>
  );
};

export const fileReducer = (
  state: IDocumentList,
  action: IFileDispatch
): IDocumentList => {
  switch (action.type) {
    case "append":
      let currentDocs = state.documents || [];
      return { documents: [...currentDocs, action.documentInfo] };
    default:
      return state;
  }
};

/**
 * Stateful Componenet Sidebar that contains a list of the docs the user has uploaded
 * @constructor
 * @param {[DocumentInfo]} docs List of documents to show
 */

const initialState = {} as IDocumentList;
const DocViewer = () => {
  const [fileList, fileDispatch] = useReducer(fileReducer, initialState);

  return (
    <FileContext.Provider value={{ fileList, fileDispatch }}>
      <Column>
        {fileList.documents ? (
          fileList.documents.map((doc, ndx) => (
            <DocCell
              docName={doc.docName}
              docType={doc.docType}
              filePath={doc.filePath}
              key={ndx}
            />
          ))
        ) : (
          <InstructionsCell />
        )}

        <StyledDropzone />
      </Column>
    </FileContext.Provider>
  );
};

export default DocViewer;
