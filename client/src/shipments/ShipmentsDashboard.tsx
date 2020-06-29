import * as React from "react";
import DocViewer from "./DocViewer";
import { Damages } from "./InfoHeader";
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
            <h3>Date</h3>
            <FormContainer key={1} id="text-input1" placeholder="Day" />
            <FormContainer placeholder="Month" />
            <FormContainer placeholder="Year" />
            <FormContainer placeholder="Date" />
            <h3>Shipment</h3>
            <FormContainer placeholder="Description" />
            <FormContainer placeholder="Consigned To" />
            <FormContainer placeholder="B/L Number" />
            <FormContainer placeholder="Carrier Booking" />
            <FormContainer placeholder="Consignor" />
            <FormContainer placeholder="Email" />
            <FormContainer placeholder="Telephone" />
            <FormContainer placeholder="SCAC" />
            <FormContainer placeholder="CID" />
          </FormGroup>
          <FormGroup label="Additional info">
            <FormContainer placeholder="SID" />

            <FormContainer placeholder="FOB" />

            <FormContainer placeholder="Amount" />
            <FormContainer placeholder="Additional Info" />
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
