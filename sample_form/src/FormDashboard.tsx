import React, { useState } from "react";
import styled from "styled-components";

import { FormGroup, InputGroup } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";

const Container = styled.div`
  flex-grow: 4;
  margin: 1em;
`;
const ChecklistColumn = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`;
const FormContainer = styled(InputGroup)`
  display: flex;
  margin: 2em;
`;

const FormDashboard = () => {
  const [dashboard, setDashboard] = useState("master");

  const handleChange = (event: any) => {
    setDashboard(event.target.value);
  };
  return (
    <React.Fragment>
      <FormControl component="fieldset">
        <RadioGroup
          aria-label="dashboard"
          name="dashboard1"
          value={dashboard}
          onChange={handleChange}
        >
          <FormControlLabel value="master" control={<Radio />} label="master" />
          <FormControlLabel
            value="default"
            control={<Radio />}
            label="default"
          />
        </RadioGroup>
      </FormControl>
      {dashboard === "default" ? (
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
              <FormContainer placeholder="Bill of Lading Number" />
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
      ) : (
        <Container>
          <ChecklistColumn>
            <h1>Master Shipping Form</h1>
            <FormGroup
              helperText="Helper text with details..."
              label="Shipping Instructions Required Fields"
              labelFor="text-input"
              labelInfo="(required)"
            >
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
      )}
    </React.Fragment>
  );
};

export default FormDashboard;
