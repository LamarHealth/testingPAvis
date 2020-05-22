import * as React from "react";
import DocViewer from "./DocViewer";
import InfoHeader, { Damages } from "./InfoHeader";
import styled from "styled-components";
import { ChecklistViewer, IDetail } from "./ChecklistViewer";
import { FormGroup, InputGroup } from "@blueprintjs/core";

const damagesPlaceholder: Damages = {
  type: "Inspection Penalty",
  amount: 300,
  description: "Your goods will face a customs fee due to mismarked goods",
};

const checklistPlaceholder: Array<IDetail> = [
  {
    statusIcon: "error",
    fieldName: "7501",
    detail: "ya done goofed",
  },
  {
    statusIcon: "tick-circle",
    fieldName: "7501",
    detail: "ya done goofed",
  },
  {
    statusIcon: "warning-sign",
    fieldName: "7501",
    detail: "",
  },
];

class ShipmentsDashboard extends React.Component {
  state = {
    response: "",
    post: "",
    responseToPost: "",
    clicked: false,
  };

  render() {
    const Container = styled.div`
      display: flex;
      height: 90vh;
    `;
    const ChecklistColumn = styled.div`
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      width: 60%;
    `;

    const FormContainer = styled(InputGroup)`
      display: flex;
      margin: 2em;
    `;
    return (
      <Container>
        <DocViewer />
        <ChecklistColumn>
          <h1>Sample Shipping Form</h1>
          <FormGroup
            helperText="Helper text with details..."
            label="Shipping Instructions Required Fields"
            labelFor="text-input"
            labelInfo="(required)"
          >
            <FormContainer key={1} id="text-input1" placeholder="Date" />
            <FormContainer key={166} id="text-input2" placeholder="Location" />

            <FormContainer key={11} id="text-input3" placeholder="SCAC" />

            <FormContainer key={16} id="text-input4" placeholder="CID" />
          </FormGroup>
          <FormGroup key={123} label="Additional info">
            <FormContainer key={15} id="text-input5" placeholder="SID" />
            <FormContainer
              key={41}
              id="text-input6"
              placeholder="Bill of Lading Number"
            />

            <FormContainer key={31} id="text-input7" placeholder="FOB" />

            <FormContainer key={12} id="text-input8" placeholder="COD Amount" />
          </FormGroup>
        </ChecklistColumn>
        {/* <ChecklistColumn>
          <InfoHeader
            departurePoint="felixstow"
            destinationPoint="kelang"
            isGood={false}
            damages={[damagesPlaceholder, damagesPlaceholder]}
          />
          <ChecklistViewer details={checklistPlaceholder} />
        </ChecklistColumn> */}
      </Container>
    );
  }
}

export default ShipmentsDashboard;
