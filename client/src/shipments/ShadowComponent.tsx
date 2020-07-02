import React from "react";
import root from "react-shadow";
// We need to use StyleSheetManager to catch and styled components and target them a node inside
// of the shadow DOM. Otherwise they will be on the document, therefore excluded.
import { StyleSheetManager } from "styled-components";

// This component is used to determine if the shadow root children have been mounted,
// we can't assume they are mounted with the parent and using a timer is risky.
const DidMount = ({ onMount }: any) => {
  React.useEffect(onMount, []);

  return null;
};

export const MyShadowComponent = ({ children }: any) => {
  const node = React.useRef(null);
  const [mounted, setMounted] = React.useState(false);
  return (
    <root.div>
      <div ref={node}>
        <DidMount onMount={() => setMounted(true)} />
        {mounted && node.current && (
          <StyleSheetManager // @ts-ignore
            target={node.current}
          >
            {children}
          </StyleSheetManager>
        )}
      </div>
    </root.div>
  );
};
