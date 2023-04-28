export interface DocThumbsReference {
  [docID: string]: string;
}

export const getThumbsFromLocalStorage = (
  callback: (thumbnails: DocThumbsReference) => void
): void => {
  chrome.storage.local.get('docThumbnails', (result) => {
    callback(result.docThumbnails || {});
  });
};

const setThumbsToLocalStorage = (thumbnails: DocThumbsReference) => {
  chrome.storage.local.set({ docThumbnails: thumbnails });
};

export const addThumbsLocalStorage = (docID: string, dataURL: string) => {
  getThumbsFromLocalStorage((storedThumbs) => {
    storedThumbs[docID] = dataURL;
    setThumbsToLocalStorage(storedThumbs);
  });
};

export const deleteThumbsLocalStorage = (docID: string) => {
  getThumbsFromLocalStorage((storedThumbs) => {
    delete storedThumbs[docID];
    setThumbsToLocalStorage(storedThumbs);
  });
};
