import * as React from "react";
import DocViewer from "./DocViewer";
import { DocumentInfo } from "./DocViewer";
import InfoHeader, { Damages } from "./InfoHeader";
import styled from "styled-components";
import { ChecklistViewer, IDetail } from "./ChecklistViewer";

const placholder: DocumentInfo = {
  docName: "Temp document [0]",
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
  state = {
    response: "",
    post: "",
    responseToPost: ""
  };
  // componentDidMount() {
  //   this.callApi()
  //     .then(res => this.setState({ response: res.express }))
  //     .catch(err => console.log(err));
  // }

  // callApi = async () => {
  //   const response = await fetch("/api/hello");
  //   const body = await response.json();
  //   if (response.status !== 200) throw Error(body.message);
  //   return body;
  // };

  // handleSubmit = async (e: any) => {
  //   e.preventDefault();
  //   const response = await fetch("/api/world", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({ post: this.state.post })
  //   });
  //   const body = await response.text();
  //   console.log(body);
  //   this.setState({ responseToPost: body });
  // };

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
    return (
      <Container>
        <DocViewer />
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
