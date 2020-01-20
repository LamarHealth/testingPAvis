import * as React from "react";
import styled from "styled-components";
import { Icon, Intent } from "@blueprintjs/core";

export interface IDetail {
  statusIcon: "error" | "tick-circle" | "warning-sign";
  fieldName: String;
  detail?: String;
}

interface IDetailList {
  details: Array<IDetail>;
}

/**
 * Sidebar column container
 */
const Column = styled.div`
  justify-content: flex-start;
  flex-direction: column;
  align-items: stretch;
  background-color: lightgray;
  border: solid;
  display: inline-block;
  width: 100%;
  padding: 1em 0;
  height: 100%;
  overflow: scroll;
`;

/**
 * Cell containing doc info
 */
const Box = styled.div`
  display: flex;
  align-items: center;
  margin: 0.25em 0.5em;
  border: solid;
  background-color: white;
  min-height: 10%;
`;

class Detail extends React.PureComponent<IDetail> {
  render() {
    return (
      <Box>
        {
          <Icon
            icon={this.props.statusIcon}
            iconSize={25}
            style={{ padding: "0.5em", marginRight: "1.5em" }}
          />
        }
        {this.props.fieldName} {this.props.detail || "Unknown"}
      </Box>
    );
  }
}

export const ChecklistViewer = (props: IDetailList) => {
  return (
    <Column>
      {props.details.map(detail => {
        return (
          <Detail
            statusIcon={detail.statusIcon}
            fieldName={detail.fieldName}
            detail={detail.detail || ""}
          ></Detail>
        );
      })}
    </Column>
  );
};
