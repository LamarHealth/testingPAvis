/* global chrome */

import { OCRDocumentInfo, StatusCodes } from "../../types/documents";
import { PDF_UPLOAD_BUCKET, OUTPUT_BUCKET } from "../Content/common/constants";

type PressignedURLResponse = {
  presigned_post: {
    url: string;
    fields: {
      key: string;
      AWSAccessKeyId: string;
      policy: string;
      signature: string;
      "x-amz-security-token": string;
    };
  };
};

type MessageRequest = {
  message?: string;
  data?: string;
  fillValue?: boolean;
  error?: boolean;
  fileName?: string;
};

export interface OCRMessageResponse {
  status: number;
  message: string;
  documentInfo: OCRDocumentInfo;
}

const base64ToBlob = (base64Data: string): Blob => {
  const splittedData = base64Data.split(",");
  const contentType = splittedData[0].match(/:(.*?);/)?.[1] || "";
  const decodedData = atob(splittedData[1]);
  const byteArray = new Uint8Array(decodedData.length);

  for (let i = 0; i < decodedData.length; i++) {
    byteArray[i] = decodedData.charCodeAt(i);
  }

  return new Blob([byteArray], { type: contentType });
};

// Post PDF to API
chrome.runtime.onMessage.addListener(
  (request: MessageRequest, sender, sendResponse) => {
    if (request.message === "fileUploaded") {
      // Receive the Base64 PDF data
      const base64Data = request.data || "";
      // Convert the Base64 data back to a Blob
      const fileBlob = base64ToBlob(base64Data);

      // Get filename from blob
      const fileName = request.fileName || "";

      // Convert blob to File
      const pdfFile = new File([fileBlob], fileName);

      // First step:
      // Get presigned POST URL from API
      const presignedGeneratorURL =
        "https://kuzoktnlpa.execute-api.us-east-1.amazonaws.com/default/doc-upload-url-generator";

      fetch(
        `${presignedGeneratorURL}?object_key=${encodeURIComponent(
          pdfFile.name
        )}`
      )
        .then((res) => res.json())
        .then((res: PressignedURLResponse) => {
          const postURL = res.presigned_post.url;
          const postFields = res.presigned_post.fields;
          // Create form data
          const formData = new FormData();

          // Add field data to formData
          Object.entries(postFields).forEach(([key, value]) => {
            formData.append(key, value);
          });
          // Add file to formData
          formData.append("file", pdfFile);

          // Second step: Upload the file to the presigned POST URL
          fetch(postURL, {
            method: "POST",
            body: formData,
          })
            .then((res) => res)
            .then((res) => {
              console.log("Uploading to S3...");
              console.log(res);

              // Third step: Trigger lambda function to process the PDF in bucket
              // attach filename to request
              const lambdaURL =
                "https://c4lcvj97v5.execute-api.us-east-1.amazonaws.com/default/plumbus-doc-upload";

              fetch(lambdaURL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  filename: pdfFile.name,
                }),
              })
                .then((res) => {
                  console.log(res);
                  if (res.status === StatusCodes.GATEWAY_TIMEOUT) {
                    console.log("Gateway timeout. Waiting 10 seconds...");
                    setTimeout(() => {
                      fetch(
                        `https://${OUTPUT_BUCKET}.s3.amazonaws.com/response_${pdfFile.name}.json`,
                        {
                          method: "GET",
                        }
                      )
                        .then((res) => res.json())
                        .then((res) => {
                          console.log("Got bucket cached respnse");
                          console.log(res);
                          const response: OCRMessageResponse = {
                            status: StatusCodes.SUCCESS,
                            message: "success",
                            documentInfo: res,
                          };
                          sendResponse(response);
                        })
                        .catch((err) => {
                          console.error("Error fetching file from API:", err);
                          const response = {
                            status: StatusCodes.FAILURE,
                            message: err,
                          };
                          sendResponse(response);
                        })
                        .finally(() => {});
                    }, 15000);
                  }
                  return res.json();
                })
                .then((res) => {
                  // Fourth step: Poll bucket for document info,
                  // as it may take a while to process

                  // Otherwise, return status code as normal
                  console.log("Completed processing document.");
                  console.log(res);
                  const response: OCRMessageResponse = !!res.docID
                    ? {
                        status: StatusCodes.SUCCESS,
                        message: "success",
                        documentInfo: res,
                      }
                    : {
                        status: StatusCodes.FAILURE,
                        message: res.message,
                        documentInfo: res,
                      };

                  sendResponse(response);
                })
                .catch((err) => {
                  console.error("Error fetching file from API:", err);
                  const response = {
                    status: StatusCodes.FAILURE,
                    message: err,
                  };
                  sendResponse(response);
                })
                .finally(() => {});
            })
            .catch((err) => {
              console.error("Error uploading file to API:", err);
              const response = { status: StatusCodes.FAILURE, message: err };
              sendResponse(response);
            })
            .finally(() => {});
        })
        .catch((err) => {
          console.error("Error fetching presigned POST URL from API:", err);
          const response = { status: StatusCodes.FAILURE, message: err };
          sendResponse(response);
        })
        .finally(() => {});

      // Return true to indicate that you will send the response asynchronously
      return true;
    }
  }
);

// TODO: Get PDF from API
chrome.runtime.onMessage.addListener(
  (request: MessageRequest, sender, sendResponse) => {
    if (request.message === "fileRequest") {
      // 1. Receive the docID
      const docID = request.data || "";
      console.log("Received docID:", docID);
      // 2. Get the PDF file
      fetch(`https://${PDF_UPLOAD_BUCKET}.s3.amazonaws.com/${docID}`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then(() => {})
        .catch((err) => {
          console.error("Error fetching file from API:", err);
          const response = { status: StatusCodes.FAILURE, message: err };
          sendResponse(response);
        })
        .finally(() => {});
      // Return true to indicate that you will send the response asynchronously
      return true;
    }
  }
);

// listen for ext button click
chrome.browserAction.onClicked.addListener(function (tab) {
  if (tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { message: "open sidebar" });
  }
});

// listen for ManualSelect in other tab sending fill value
chrome.runtime.onMessage.addListener(function (request: MessageRequest) {
  if (request.fillValue) {
    // i.e. if sent from ManualSelect tab
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id !== undefined) {
          chrome.tabs.sendMessage(tab.id, { ...request });
        }
      });
    });
  }
});

// listen for RenderModal sending back an error message
chrome.runtime.onMessage.addListener(function (request: MessageRequest) {
  if (request.error) {
    // i.e. if sent from RenderModal, saying that eventTarget is falsy
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id !== undefined) {
          chrome.tabs.sendMessage(tab.id, { ...request });
        }
      });
    });
  }
});
