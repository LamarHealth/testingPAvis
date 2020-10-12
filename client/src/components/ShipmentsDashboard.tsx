import * as React from "react";
import styled from "styled-components";
import { FormGroup, InputGroup, TextArea } from "@blueprintjs/core";
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

    const StyledInput = styled(InputGroup)`
      display: flex;
      margin: 2em;
    `;

    const StyledTextArea = styled(TextArea)`
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
            <StyledInput placeholder="Bill of Lading Number" />
            <StyledInput placeholder="Freight Terms" />
            <StyledInput placeholder="Export References" />
            <StyledTextArea placeholder="DOMESTIC ROUTING" />
            <h3>Shipper</h3>
            <StyledInput placeholder="Shipper Name" />
            <StyledInput placeholder="Shipper Address" />
            <StyledInput placeholder="Shipper Contact Info" />
            <h3>Consignee</h3>
            <StyledInput placeholder="Consignee Name" />
            <StyledInput placeholder="Consignee Address" />
            <StyledInput placeholder="Consignee Contact Info" />
            <h3>Notify Party</h3>
            <StyledInput placeholder="Notify Party Name" />
            <StyledInput placeholder="Notify Party Address" />
            <StyledInput placeholder="Notify Party Contact Info" />
            <h3>Other</h3>
            <StyledInput placeholder="Shipper's Declaration of Value" />
            <StyledInput placeholder="Express Release" />
            <StyledInput placeholder="AES ITN" />
            <StyledInput placeholder="HS Code" />
            <StyledInput placeholder="Comments" />
          </FormGroup>
        </ChecklistColumn>
      </Container>
    );
  }
}

export default ShipmentsDashboard;
