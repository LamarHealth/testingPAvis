/* global chrome */
import { openDB } from "idb";

async function setupIndexedDB() {
  const db = await openDB("myDatabase", 1, {
    upgrade(database) {
      database.createObjectStore("files");
    },
  });
  return db;
}

async function postFile(file) {
  const formData = new FormData();
  formData.append("pdfFile", file);

  const response = await fetch("https://your-api.example.com/upload", {
    statusCode: 200,
    method: "POST",
    body: formData,
  });

  return response;
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === "fileUploaded") {
    const fileId = request.fileId;

    // Retrieve the ArrayBuffer from IndexedDB
    const db = await setupIndexedDB();
    const arrayBuffer = await db.get("files", fileId);
    db.close();

    // Convert the ArrayBuffer back to a Blob (PDF)
    const pdfFile = new File([arrayBuffer], `${fileId}.pdf`, {
      type: "application/pdf",
    });

    const formData = new FormData();
    formData.append("pdfFile", pdfFile);

    // Send a POST request with the file to the API endpoint
    fetch(
      `https://c4lcvj97v5.execute-api.us-east-1.amazonaws.com/default/plumbus-doc-upload`,
      {
        statusCode: 200,
        method: "POST",
        body: pdfFile,
      }
    )
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        console.log("err1");
        console.log(err);
      })
      .then((res) => {
        console.log(res);
        sendResponse(res);
      })
      .catch((err) => {
        console.log("err2");
        console.log(err);
      });

    console.log("File uploaded to API:", response);
  }
});

// listen for ext button click
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, { message: "open sidebar" });
});

// listen for ManualSelect in other tab sending fill value
chrome.runtime.onMessage.addListener(function (request) {
  if (request.fillValue) {
    // i.e. if sent from ManualSelect tab
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => chrome.tabs.sendMessage(tab.id, { ...request }));
    });
  }
});

// listen for RenderModal sending back an error message
chrome.runtime.onMessage.addListener(function (request) {
  if (request.error) {
    // i.e. if sent from RenderModal, saying that eventTarget is falsy
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => chrome.tabs.sendMessage(tab.id, { ...request }));
    });
  }
});

// listen for upload to S3 storage via POST request
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === "upload") {
//     // take blob url address and convert to blob
//     console.log("reading request...");
//     const blobURL = request.file;
//     console.log(blobURL);
//     console.log(typeof blobURL);
//     // convert blob url to blob

//     const reader = new FileReader();
//     reader.readAsDataURL(blob);
//     console.log(reader);

//     reader.onloadend = () => {
//       const base64data = reader.result;
//       console.log("converted data to base64");
//       console.log(base64data);

//       // i.e. sent from the uploader
//       console.log(request);
//       fetch(
//         `https://c4lcvj97v5.execute-api.us-east-1.amazonaws.com/default/plumbus-doc-upload`,
//         {
//           statusCode: 200,
//           method: "POST",
//           body: base64data,
//         }
//       )
//         .then((res) => {
//           return res.json();
//         })
//         .catch((err) => {
//           console.log("err1");
//           console.log(err);
//         })
//         .then((res) => {
//           console.log(res);
//           sendResponse(res);
//         })
//         .catch((err) => {
//           console.log("err2");
//           console.log(err);
//         });
//     };
//   }
// });
