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
  state = {
    response: "",
    post: "",
    responseToPost: ""
  };
  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch("/api/hello");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  handleSubmit = async (e: any) => {
    e.preventDefault();
    const response = await fetch("/api/world", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ post: this.state.post })
    });
    const body = await response.text();
    this.setState({ responseToPost: body });
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
    return (
      <Container>
        <p>{this.state.response}</p>
        <form onSubmit={this.handleSubmit}>
          <p>
            <strong>Post to Server:</strong>
          </p>
          <input
            type="text"
            value={this.state.post}
            onChange={e => this.setState({ post: e.target.value })}
          />
          <button type="submit">Submit</button>
        </form>
        <p>{this.state.responseToPost}</p>
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
