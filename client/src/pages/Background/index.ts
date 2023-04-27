/* global chrome */

import { OCRDocumentInfo, StatusCodes } from "../../types/documents";
import { PDF_UPLOAD_BUCKET } from "../Content/common/constants";

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
      console.log("Received Base64 data:", base64Data);
      // Convert the Base64 data back to a Blob
      const fileBlob = base64ToBlob(base64Data);

      // Get filename from blob
      const fileName = request.fileName || "";

      // Convert blob to File
      const pdfFile = new File([fileBlob], fileName);

      console.log(pdfFile);

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
          console.log("res");
          console.log(res);

          const postURL = res.presigned_post.url;
          const postFields = res.presigned_post.fields;
          // Create form data
          // const formData = new FormData();
          // formData.append("file", pdfFile);
          console.log("---");
          // @ts-ignore
          // for (const [key, value] of formData.entries()) {
          //   console.log(`${key}: ${value}`);
          // }
          console.log("---");
          console.log(pdfFile);
          console.log("formData.entries()");
          console.log("postfields", postFields);

          const poostFields = {
            key: "GetFile (1).pdf",
            AWSAccessKeyId: "ASIAUTAAG3ND3PRJQVHK",
            "x-amz-security-token": "IQoJb3JpZ2luX2VjE...",
            policy: "eyJleHBpc...",
            signature: "FCqonUrxgiOcR6huzWUptP8I1l0=",
          };
          const formData = new FormData();

          // Add field data to formData
          Object.entries(poostFields).forEach(([key, value]) => {
            console.log("key", key);
            console.log("value", value);
            formData.append(key, value);
          });
          console.log("***");
          // @ts-ignore
          for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
          }
          console.log("***");

          // Second step: Upload the file to the presigned POST URL
          fetch(postURL, {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((res: OCRDocumentInfo) => {
              console.log("Result");
              console.log(res);

              const docID = res.docID;

              // If docID is not on the response, then there was an error

              const response: OCRMessageResponse = !!docID
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
