import * as React from "react";
import DocViewer from "./DocViewer";
import { DocumentInfo } from "./DocViewer";
import InfoHeader from "./InfoHeader";
import styled from "styled-components";

const placholder: DocumentInfo = {
  docName: "Doc 1231a",
  docType: "Bill of Lading",
  filePath: "123123"
};

class ShipmentsDashboard extends React.Component {
  render() {
    const Container = styled.div`
      display: flex;
    `;
    const ChecklistColumn = styled.div`
      justify-content: center;
    `;
    return (
      <Container>
        <DocViewer documents={[placholder, placholder, placholder]} />
        <ChecklistColumn>
          <InfoHeader
            departurePoint="felixstow"
            destinationPoint="kelang"
            isGood={false}
          ></InfoHeader>
        </ChecklistColumn>
      </Container>
    );
  }
}

export default ShipmentsDashboard;
