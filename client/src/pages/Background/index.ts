/* global chrome */

import {
  OCRMessageResponse,
  StatusCodes,
  FileRequestResponse,
} from "../../types/documents";
import { POST_GENERATOR_API } from "../Content/common/constants";

import { fetchAndReturnData } from "./query";
import { base64ToBlob, blobToBase64 } from "../../utils/functions";

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
      console.log(fileName);
      console.log(fileName);

      // Convert blob to File
      const pdfFile = new File([fileBlob], fileName);
      // First step:
      // Get presigned POST URL from API
      const presignedGeneratorURL = POST_GENERATOR_API;
      fetch(presignedGeneratorURL, {
        method: "POST",
        body: fileName,
      })
        .then((res) => res.json())
        .then((res: PresignedURLResponse) => {
          console.log("Received POST/GET URLs", res);
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
              console.log("Uploading to S3...!", postURL);

              // Third step: Poll all other URLs and send them to the content script
              const urls = [pdfURL, kvpsURL, tableURL, linesURL];
              fetchAndReturnData(urls)
                .then((res) => {
                  console.log("Sending response to content script...");
                  const response: OCRMessageResponse = {
                    status: StatusCodes.SUCCESS,
                    message: "File uploaded successfully",
                    documentInfo: {
                      docID: fileName,
                      keyValuePairs: res.response2,
                      lines: res.response4,
                      pdf: pdfURL,
                      table: res.response3,
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
      const pdfUrl = request.data || "";
      console.log("Received docID:", pdfUrl);
      // 2. Get the PDF file
      fetch(pdfUrl, {
        method: "GET",
      })
        .then((res) => {
          console.log("Received PDF file from S3");
          return res.blob();
        })
        .then((res) => {
          // 3. Convert the PDF file to Base64
          console.log("Converting PDF file to Base64...");
          console.log(res);
          return blobToBase64(res);
        })
        .then((base64file) => {
          // 4. Send the Base64 PDF data to the content script
          console.log("Sending response to content script...");
          const response: FileRequestResponse = {
            status: StatusCodes.SUCCESS,
            message: "File received successfully",
            base64file: base64file,
          };

          sendResponse(response);
        })
        .catch((err) => {
          console.error("Error fetching file from API:", err);
          const response: FileRequestResponse = {
            status: StatusCodes.FAILURE,
            message: err,
            base64file: "",
          };

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
