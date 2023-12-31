import React, { useState } from "react";

import styled from "styled-components";
import { Rnd, RndResizeCallback, DraggableData } from "react-rnd";

import { colors } from "../common/colors";
import {
  KONVA_MODAL_HEIGHT,
  MODAL_SHADOW,
  KONVA_MODAL_OFFSET_X,
  KONVA_MODAL_OFFSET_Y,
  DOC_IMAGE_WIDTH,
} from "../common/constants";

const StyledRnD = styled(Rnd)`
  background: #f0f0f0;
  position: absolute;
  height: ${KONVA_MODAL_HEIGHT}px;
  border: 1px solid ${colors.MODAL_BORDER};
  box-shadow: ${MODAL_SHADOW};
`;

const ScrollContainer = styled.div``;

const resizeHandleStylesPayload = {
  topBottom: { height: "15px", zIndex: 1 },
  corner: { height: "30px", width: "30px", zIndex: 1 },
  sides: { width: "15px", zIndex: 1 },
};

export const RndComponent = ({ children }: { children: React.ReactNode }) => {
  const [konvaModalDraggCoords, setKonvaModalDraggCoords] = useState({
    x: KONVA_MODAL_OFFSET_X,
    y: KONVA_MODAL_OFFSET_Y,
  });
  const [konvaModalDimensions, setKonvaModalDimensions] = useState({
    width: DOC_IMAGE_WIDTH,
    height: KONVA_MODAL_HEIGHT,
  });

  // NO new tab: Rnd drag & resize
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
  };

  return (
    <div>
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
        <ScrollContainer style={{ height: konvaModalDimensions.height }}>
          {children}
        </ScrollContainer>
      </StyledRnD>
    </div>
  );
};
