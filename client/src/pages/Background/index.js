/* global chrome */

const base64ToBlob = (base64Data, contentType) => {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
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
        body: formData,
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
