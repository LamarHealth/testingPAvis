import * as React from "react";
import styled from "styled-components";
import { Icon, Intent } from "@blueprintjs/core";

interface IHeaderContainer {
  departurePoint: String;
  destinationPoint: String;
  isGood: Boolean;
  damages?: Array<Damages>;
}

export interface Damages {
  type: String;
  amount: number;
  description?: String;
}

const Arrow = (props: IHeaderContainer) => {
  const ArrowLine = styled.div`
    height: 1px;
    width: 30%;
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

const DamagesSubsection = (props: Damages) => {
  return (
    <h3 style={{ margin: "0.25em 0em" }}>
      Estimated <u>${props.amount.toString()}</u> {props.type}.{" "}
      {props.description || ""}
    </h3>
  );
};

class StatusContainer extends React.Component<{
  isGood: Boolean;
  damages?: Array<Damages>;
}> {
  render() {
    const RowContainer = styled.div`
      display: flex;
      align-items: center;
    `;
    const ColContainer = styled.div`
      display: flex;
      flex-direction: column;
      justify-content: center;
    `;
    return (
      <ColContainer>
        <RowContainer>
          <Icon
            icon={this.props.isGood ? "tick-circle" : "error"}
            iconSize={50}
            intent={this.props.isGood ? Intent.SUCCESS : Intent.DANGER}
            style={{ padding: "0 1em 0 0 " }}
          />
          <h1>
            {this.props.isGood
              ? "All of your information has been checked and verified"
              : "There are critical errors in your shipping documents"}
          </h1>
        </RowContainer>
        {this.props.damages === undefined ||
          this.props.damages.map((damage, ndx) => {
            return <DamagesSubsection {...damage} key={ndx} />;
          })}
      </ColContainer>
    );
  }
}
class InfoHeader extends React.Component<IHeaderContainer> {
  render() {
    const HeaderContainer = styled.div`
      justify-content: center;
      flex-direction: column;
      width: 100%;
      padding-right: 1em;
    `;
    return (
      <HeaderContainer>
        <ItineraryContainer
          departurePoint={this.props.departurePoint}
          destinationPoint={this.props.destinationPoint}
          isGood={this.props.isGood}
        />
        <StatusContainer
          isGood={this.props.isGood}
          damages={this.props.damages}
        />
      </HeaderContainer>
    );
  }
}

export default InfoHeader;
