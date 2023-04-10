/* global chrome */
import { openDB } from 'idb';
const indexDBName = process.env.INDEXED_DB;

const getFileFromIndexedDB = async (fileId) => {
  const db = await openDB(indexDBName, 1);
  const file = await db.get('files', fileId);
  return file;
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === 'fileUploaded') {
    const fileId = request.fileId;
    console.log(fileId);

    // Retrieve the ArrayBuffer from IndexedDB
    const arrayBuffer = await getFileFromIndexedDB(fileId);
    console.log(arrayBuffer);
    // Convert the ArrayBuffer back to a Blob (PDF)
    const pdfFile = new File([arrayBuffer], `${fileId}.pdf`, {
      type: 'application/pdf',
    });
    console.log('File uploaded to API:');
    console.log(pdfFile);

    // Create a FormData object and append the PDF file to it
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    // Send a POST request with the file to the API endpoint
    fetch(
      `https://c4lcvj97v5.execute-api.us-east-1.amazonaws.com/default/plumbus-doc-upload`,
      {
        statusCode: 200,
        method: 'POST',
        body: formData,
      }
    )
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        console.log('err1');
        console.log(err);
      })
      .then((res) => {
        console.log(res);
        sendResponse(res);
      })
      .catch((err) => {
        console.log('err2');
        console.log(err);
      });

    console.log('File uploaded to API:');
    return true;
  }
});

// listen for ext button click
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, { message: 'open sidebar' });
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
