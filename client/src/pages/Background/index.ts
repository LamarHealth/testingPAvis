/* global chrome */

import { OCRDocumentInfo, StatusCodes } from "../../types/documents";
import { PDF_UPLOAD_BUCKET } from "../Content/common/constants";

type MessageRequest = {
  message?: string;
  data?: string;
  fillValue?: boolean;
  error?: boolean;
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
      // 1. Receive the Base64 PDF data
      const base64Data = request.data || "";
      console.log("Received Base64 data:", base64Data);
      // 2. Convert the Base64 data back to a Blob
      const pdfFile = base64ToBlob(base64Data);

      console.log(pdfFile);

      // 3. Upload the PDF file
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      fetch(
        `https://c4lcvj97v5.execute-api.us-east-1.amazonaws.com/default/plumbus-doc-upload`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfData: base64Data }),
        }
      )
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
      // Return true to indicate that you will send the response asynchronously
      return true;
    }
  }
);

// Get PDF from API
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
