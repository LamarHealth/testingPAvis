/* global chrome */

import { OCRDocumentInfo, StatusCodes } from "../../types/documents";
import {
  PDF_UPLOAD_BUCKET,
  POST_GENERATOR_API,
} from "../Content/common/constants";

import { fetchAndReturnData } from "./query";

type PresignedURLResponse = {
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
  pdf: string;
  kvps: string;
  table: string;
  lines: string;
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
      const presignedGeneratorURL = POST_GENERATOR_API;

      fetch(
        `${presignedGeneratorURL}?object_key=${encodeURIComponent(
          pdfFile.name
        )}`
      )
        .then((res) => res.json())
        .then((res: PresignedURLResponse) => {
          // Presigned POST
          const postURL = res.presigned_post.url;
          const postFields = res.presigned_post.fields;
          // Presigned GETs
          const pdfURL = res.pdf;
          const kvpsURL = res.kvps;
          const tableURL = res.table;
          const linesURL = res.lines;

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

              // Third step: Poll all other URLs and send them to the content script
              const urls = [pdfURL, kvpsURL, tableURL, linesURL];
              fetchAndReturnData(urls)
                .then((res) => {
                  console.log("Sending response to content script...");
                  const response = {
                    status: StatusCodes.SUCCESS,
                    message: "File uploaded successfully",
                    documentInfo: {
                      pdf: res.response1,
                      kvps: res.response2,
                      table: res.response3,
                      lines: res.response4,
                    },
                  };
                  sendResponse(response);
                })
                .catch((err) => {
                  console.error("Error fetching data from API:", err);
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
