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
          <h1>Master Shipping Form</h1>
          <FormGroup
            helperText="Helper text with details..."
            label="Shipping Instructions Required Fields"
            labelFor="text-input"
            labelInfo="(required)"
          >
            <FormContainer placeholder="Bill of Lading Number" />
            <FormContainer placeholder="Freight Terms" />
            <FormContainer placeholder="Export References" />
            <h3>Shipper</h3>
            <FormContainer placeholder="Shipper Name" />
            <FormContainer placeholder="Shipper Address" />
            <FormContainer placeholder="Shipper Contact Info" />
            <h3>Consignee</h3>
            <FormContainer placeholder="Consignee Name" />
            <FormContainer placeholder="Consignee Address" />
            <FormContainer placeholder="Consignee Contact Info" />
            <h3>Notify Party</h3>
            <FormContainer placeholder="Notify Party Name" />
            <FormContainer placeholder="Notify Party Address" />
            <FormContainer placeholder="Notify Party Contact Info" />
            <h3>Other</h3>
            <FormContainer placeholder="Shipper's Declaration of Value" />
            <FormContainer placeholder="Express Release" />
            <FormContainer placeholder="AES ITN" />
            <FormContainer placeholder="HS Code" />
            <FormContainer placeholder="Comments" />
          </FormGroup>
        </ChecklistColumn>
      </Container>
    );
  }
}

export default ShipmentsDashboard;
