import root from "react-shadow";
import { jssPreset, StylesProvider } from "@material-ui/styles";
import { create } from "jss";
import { StyleSheetManager } from "styled-components";

import React, { useState, ReactNode } from "react";

interface WrappedJssComponentProps {
  children: ReactNode;
  wrapperClassName: string;
}

const DidMount = ({ onMount }: any) => {
  React.useEffect(onMount, []);

  return null;
};
// @ts-ignore
const WrappedJssComponent = ({
  children,
  wrapperClassName,
}: WrappedJssComponentProps) => {
  const node = React.useRef(null);
  const [mounted, setMounted] = React.useState(false);
  const [jss, setJss] = useState(null);
  // @ts-ignore

  function setRefAndCreateJss(headRef) {
    if (headRef && !jss) {
      const createdJssWithRef = create({
        ...jssPreset(),
        insertionPoint: headRef,
      });
      // @ts-ignore

      setJss(createdJssWithRef);
    }
  }
  // @ts-ignore
  return (
    <div className={wrapperClassName}>
      <root.div>
        <head>
          <style ref={setRefAndCreateJss}></style>
        </head>
        <div ref={node}>
          <DidMount onMount={() => setMounted(true)} />
          {mounted && node.current && (
            <StyleSheetManager // @ts-ignore
              target={node.current}
            >
              {
                // @ts-ignore
                jss && <StylesProvider jss={jss}>{children}</StylesProvider>
              }
            </StyleSheetManager>
          )}
        </div>
      </root.div>
    </div>
  );
};

export default WrappedJssComponent;
