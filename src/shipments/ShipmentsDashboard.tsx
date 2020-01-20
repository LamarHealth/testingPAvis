import * as React from "react";
import DocViewer from "./DocViewer";
import { DocumentInfo } from "./DocViewer";
import InfoHeader, { Damages } from "./InfoHeader";
import styled from "styled-components";
import { ChecklistViewer, IDetail } from "./ChecklistViewer";

const placholder: DocumentInfo = {
  docName: "Doc 1231a",
  docType: "Bill of Lading",
  filePath: "123123"
};

const damagesPlaceholder: Damages = {
  type: "Inspection Penalty",
  amount: 300,
  description: "Your goods will face a customs fee due to mismarked goods"
};

const checklistPlaceholder: Array<IDetail> = [
  {
    statusIcon: "error",
    fieldName: "7501",
    detail: "ya done goofed"
  },
  {
    statusIcon: "tick-circle",
    fieldName: "7501",
    detail: "ya done goofed"
  },
  {
    statusIcon: "warning-sign",
    fieldName: "7501",
    detail: ""
  }
];

class ShipmentsDashboard extends React.Component {
  render() {
    const Container = styled.div`
      display: flex;
    `;
    const ChecklistColumn = styled.div`
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      width: 60%;
    `;
    return (
      <Container>
        <DocViewer documents={[placholder, placholder, placholder]} />
        <ChecklistColumn>
          <InfoHeader
            departurePoint="felixstow"
            destinationPoint="kelang"
            isGood={false}
            damages={[damagesPlaceholder, damagesPlaceholder]}
          />
          <ChecklistViewer details={checklistPlaceholder} />
        </ChecklistColumn>
      </Container>
    );
  }
}

export default ShipmentsDashboard;
