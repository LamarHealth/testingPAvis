import React, { useContext } from "react";

import styled from "styled-components";
import { Rnd, RndResizeCallback, DraggableData } from "react-rnd";

import { KonvaModalContext } from "./ManualSelect";
import { MainModalContext } from "./RenderModal";
import { KonvaModal } from "./KonvaModal";

import { colors } from "../common/colors";
import { KONVA_MODAL_HEIGHT, MODAL_SHADOW } from "../common/constants";

const StyledRnD = styled(Rnd)`
  background: #f0f0f0;
  position: absolute;
  height: ${KONVA_MODAL_HEIGHT}px;
  overflow-y: hidden;
  border: 1px solid ${colors.MODAL_BORDER};
  box-shadow: ${MODAL_SHADOW};
`;

const StyledDiv = styled.div`
  overflow-y: scroll;
  height: ${KONVA_MODAL_HEIGHT}px;
`;

const resizeHandleStylesPayload = {
  topBottom: { height: "15px", zIndex: 1, backgroundColor: "red" },
  corner: { height: "30px", width: "30px", zIndex: 1, backgroundColor: "red" },
  sides: { width: "15px", zIndex: 1, backgroundColor: "red" },
};

export const RndComponent = () => {
  const {
    konvaModalDraggCoords,
    setKonvaModalDraggCoords,
    konvaModalDimensions,
    setKonvaModalDimensions,
    setDocImageDimensions,
  } = useContext(MainModalContext);
  const { docImageURL } = useContext(KonvaModalContext);

  // drag & resize
  const handleDragStop = (e: any, data: DraggableData) => {
    const [x, y] = [data.x, data.y];
    setKonvaModalDraggCoords({ x, y });
  };

  const handleResizeStop: RndResizeCallback = (
    e,
    dir,
    refToElement,
    delta,
    position
  ) => {
    const [width, height] = [
      parseInt(refToElement.style.width.replace("px", "")),
      parseInt(refToElement.style.height.replace("px", "")),
    ];
    const [x, y] = [position.x, position.y];

    setKonvaModalDimensions({ width, height }); // set new modal dim
    setKonvaModalDraggCoords({ x, y }); // set coords after drag
    setDocImageDimensions({
      // set doc img dim
      width,
      height: width * docImageURL.heightXWidthMultiplier,
    });
  };

  return (
    <StyledRnD
      position={konvaModalDraggCoords}
      onDragStop={handleDragStop}
      bounds="window"
      size={konvaModalDimensions}
      onResizeStop={handleResizeStop}
      resizeHandleStyles={{
        bottom: resizeHandleStylesPayload.topBottom,
        bottomLeft: resizeHandleStylesPayload.corner,
        bottomRight: resizeHandleStylesPayload.corner,
        left: resizeHandleStylesPayload.sides,
        right: resizeHandleStylesPayload.sides,
        top: resizeHandleStylesPayload.topBottom,
        topLeft: resizeHandleStylesPayload.corner,
        topRight: resizeHandleStylesPayload.corner,
      }}
      cancel={".docit-no-drag"}
    >
      <StyledDiv>
        <KonvaModal />
      </StyledDiv>
    </StyledRnD>
  );
};
