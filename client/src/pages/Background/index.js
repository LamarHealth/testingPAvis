/* global chrome */

const base64ToBlob = (base64Data) => {
  const splittedData = base64Data.split(',');
  const contentType = splittedData[0].match(/:(.*?);/)[1];
  const decodedData = atob(splittedData[1]);
  const byteArray = new Uint8Array(decodedData.length);

  for (let i = 0; i < decodedData.length; i++) {
    byteArray[i] = decodedData.charCodeAt(i);
  }

  return new Blob([byteArray], { type: contentType });
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === 'fileUploaded') {
    // 1. Receive the Base64 PDF data
    const base64Data = request.data;
    console.log('Received Base64 data:', base64Data);

    // 2. Convert the Base64 data back to a Blob
    const pdfFile = base64ToBlob(base64Data, 'application/pdf');

    console.log(pdfFile);

    // 3. Upload the PDF file
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    fetch(
      `https://c4lcvj97v5.execute-api.us-east-1.amazonaws.com/default/plumbus-doc-upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfData: base64Data }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        sendResponse(res);
      })
      .catch((err) => {
        console.error('Error uploading file to API:', err);
        sendResponse({ error: err.message });
      });

    // Indicate that the response will be sent asynchronously
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
