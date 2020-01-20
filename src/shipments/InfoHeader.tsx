import * as React from "react";
import styled from "styled-components";
import { Icon, Intent } from "@blueprintjs/core";

interface IHeaderContainer {
  departurePoint: String;
  destinationPoint: String;
  isGood: Boolean;
  damages?: Array<Damages>;
}

interface Damages {
  type: String;
  amount: number;
  description?: String;
}

interface IState {
  icon: "error" | "tick-circle";
  intent: Intent;
}

const Arrow = (props: IHeaderContainer) => {
  const ArrowLine = styled.div`
    height: 1px;
    width: 5em;
    display: flex;
    background-color: black;
  `;
  const ArrowHead = styled.div`
    width: 0;
    height: 0;
    border-top: 0.5em solid transparent;
    border-left: 2em solid #555;
    border-bottom: 0.5em solid transparent;
  `;
  const ArrowContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  const Title = styled.h1`
    padding: 0 0.5em;
  `;
  return (
    <ArrowContainer>
      <Title>{props.departurePoint}</Title>
      <ArrowLine />
      <ArrowHead />
      <Title>{props.destinationPoint}</Title>
    </ArrowContainer>
  );
};

class ItineraryContainer extends React.Component<IHeaderContainer> {
  render() {
    return (
      <div>
        <Arrow {...this.props} />
      </div>
    );
  }
}

class StatusContainer extends React.Component<{ isGood: Boolean }> {
  render() {
    const Container = styled.div`
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    return (
      <Container>
        <Icon
          icon={this.props.isGood ? "tick-circle" : "error"}
          iconSize={50}
          intent={this.props.isGood ? Intent.SUCCESS : Intent.DANGER}
          style={{ padding: "1em" }}
        />
        <h1>
          {this.props.isGood
            ? "All of your information has been checked and verified"
            : "There are critical errors in your shipping documents"}
        </h1>
      </Container>
    );
  }
}

class ChecklistContainer extends React.Component {
  render() {
    return <div />;
  }
}

class InfoHeader extends React.Component<IHeaderContainer> {
  constructor(props: IHeaderContainer) {
    super(props);
    this.state = {
      // icon: isGood ? "tick-circle" : "error",
      // intent: isGood ? Intent.SUCCESS : Intent.DANGER
    };
  }

  render() {
    const HeaderContainer = styled.div`
      justify-content: center;
      flex-direction: column;
      width: 50%;
      padding-right: 1em;
    `;
    return (
      <HeaderContainer>
        <ItineraryContainer
          departurePoint={this.props.departurePoint}
          destinationPoint={this.props.destinationPoint}
          isGood={this.props.isGood}
        />
        <StatusContainer isGood={this.props.isGood} />
      </HeaderContainer>
    );
  }
}

export default InfoHeader;
