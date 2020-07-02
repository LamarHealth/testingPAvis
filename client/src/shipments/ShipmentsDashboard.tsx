import * as React from "react";
import styled from "styled-components";
import { FormGroup, InputGroup } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";

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
      margin: 1em;
      height: 90vh;
      width: 100vw;
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
      </Container>
    );
  }
}

export default ShipmentsDashboard;
