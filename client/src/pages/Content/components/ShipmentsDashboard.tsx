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
            <StyledInput
              placeholder="Bill of Lading Number"
              data-docit-input="true"
            />
            <StyledInput placeholder="Freight Terms" data-docit-input="true" />
            <StyledInput placeholder="Export References ***NO data-docit-input***" />
            <StyledTextArea
              placeholder="DOMESTIC ROUTING"
              data-docit-input="true"
            />
            <h3>Shipper</h3>
            <StyledInput placeholder="Shipper Name" data-docit-input="true" />
            <StyledInput
              placeholder="Shipper Address"
              data-docit-input="true"
            />
            <StyledInput
              placeholder="Shipper Contact Info"
              data-docit-input="true"
            />
            <h3>Consignee</h3>
            <StyledInput placeholder="Consignee Name" data-docit-input="true" />
            <StyledInput
              placeholder="Consignee Address"
              data-docit-input="true"
            />
            <StyledInput
              placeholder="Consignee Contact Info"
              data-docit-input="true"
            />
            <h3>Notify Party</h3>
            <StyledInput
              placeholder="Notify Party Name"
              data-docit-input="true"
            />
            <StyledInput
              placeholder="Notify Party Address"
              data-docit-input="true"
            />
            <StyledInput
              placeholder="Notify Party Contact Info"
              data-docit-input="true"
            />
            <h3>Other</h3>
            <StyledInput
              placeholder="Shipper's Declaration of Value"
              data-docit-input="true"
            />
            <StyledInput
              placeholder="Express Release"
              data-docit-input="true"
            />
            <StyledInput placeholder="AES ITN" data-docit-input="true" />
            <StyledInput placeholder="HS Code" data-docit-input="true" />
            <StyledInput placeholder="Comments" data-docit-input="true" />
          </FormGroup>
        </ChecklistColumn>
      </Container>
    );
  }
}

export default ShipmentsDashboard;
