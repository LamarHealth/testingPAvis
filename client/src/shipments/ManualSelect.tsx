import React, { useState } from "react";
import styled from "styled-components";
import { Dialog, HTMLTable } from "@blueprintjs/core";

import { getKeyValuePairsByDoc } from "./KeyValuePairs";

const ManualSelectButton = styled.button`
  border: 1px solid white;
  border-radius: 5px;
  font-weight: bold;
  background-color: #f9e526;
  padding: 0.3em 0.7em;

  :hover {
    opacity: 0.5;
  }
`;

export const ManualSelect = () => {
  const docDataByDoc = getKeyValuePairsByDoc();
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <HTMLTable>
      <tbody>
        <tr>
          <td>
            <i>
              <strong>manual select</strong>
            </i>
          </td>
          <td>
            {docDataByDoc.map((doc: any) => (
              <div>
                <ManualSelectButton onClick={() => setOverlayOpen(true)}>
                  {doc.docName}
                </ManualSelectButton>
              </div>
            ))}
          </td>
        </tr>
      </tbody>
      <Dialog isOpen={overlayOpen} onClose={() => setOverlayOpen(false)}>
        hello world!
      </Dialog>
    </HTMLTable>
  );
};
