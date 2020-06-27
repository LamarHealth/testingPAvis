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

  const getDocsFromServer = async () => {
    const response: any = fetch(
      `/api/docs/${encodeURIComponent(
        "MASTERS EXAMPLE #3 - LINE BREAK (SAMPLE DATA)-3.png"
      )}`,
      {
        method: "GET",
      }
    )
      .then((data: any) => {
        console.log(data);

        return data.body;
      })
      .then((rs) => {
        const reader = rs.getReader();

        return new ReadableStream({
          async start(controller) {
            while (true) {
              const { done, value } = await reader.read();

              // When no more data needs to be consumed, break the reading
              if (done) {
                break;
              }

              // Enqueue the next data chunk into our target stream
              controller.enqueue(value);
            }

            // Close the stream
            controller.close();
            reader.releaseLock();
          },
        });
      })
      // Create a new response out of the stream
      .then((rs) => new Response(rs))
      // Create an object URL for the response
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob));

    // .then((data) => data.body)
    // .then((body: any) => {
    //   console.log(body);

    //   var str = body.reduce(function (a: any, b: any) {
    //     return a + String.fromCharCode(b);
    //   }, "");
    //   const ascII: any = btoa(str).replace(/.{76}(?=.)/g, "$&\n");
    //   const url = "data:image/jpeg;base64," + ascII;
    //   console.log(url);
    // });

    // const bodyStream: any = (await response.json()).Body.data;

    // const blob = new Blob(bodyStream);

    // const url = URL.createObjectURL(blob);

    // response.blob().then((blob: any) => {
    //   // let binary = "";
    //   // const bytes = new Uint8Array(buffer);
    //   // const len = bytes.byteLength;
    //   // for (let i = 0; i < len; i++) {
    //   //   binary += String.fromCharCode(bytes[i]);
    //   // }
    //   // const base64 = window.btoa(binary);
    //   // console.log(base64);
    //   const url = URL.createObjectURL(blob);

    //   console.log(url);
    // });

    // .then((moreData: any) => {
    //   var blob = new Blob([moreData], { type: "image/jpeg" });
    //   const url = URL.createObjectURL(blob);
    //   console.log("data:image/jpeg;base64," + url);
    // });
  };

  getDocsFromServer();

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
