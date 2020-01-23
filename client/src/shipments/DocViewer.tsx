import * as React from "react";
import styled from "styled-components";

interface IDocViewerProps {
  documents: Array<DocumentInfo>;
}

export interface DocumentInfo {
  docType: String;
  docName: String;
  filePath: String;
}

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
`;

/**
 * Cell containing doc info
 */
const Box = styled.div`
  margin: 1em 0.5em;
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

/**
 * Stateful Componenet Sidebar that contains a list of the docs the user has uploaded
 * @constructor
 * @param {[DocumentInfo]} docs List of documents to show
 */
export default class DocViewer extends React.PureComponent<IDocViewerProps> {
  render() {
    return (
      <Column>
        {this.props.documents.map((doc, ndx) => (
          <DocCell
            docName={doc.docName}
            docType={doc.docType}
            filePath={doc.filePath}
            key={ndx}
          />
        ))}
        <Box>Upload more documents</Box>
      </Column>
    );
  }
}
