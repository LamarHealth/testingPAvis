export interface DocThumbsReference {
  [docID: string]: string;
}

export const getThumbsFromLocalStorage = (): DocThumbsReference =>
  JSON.parse(localStorage.getItem("docThumbnails") || "{}");

const setThumbsToLocalStorage = (thumbnails: DocThumbsReference) => {
  localStorage.setItem("docThumbnails", JSON.stringify(thumbnails));
};

export const addThumbsLocalStorage = (docID: string, dataURL: string) => {
  const storedThumbs = getThumbsFromLocalStorage();
  storedThumbs[docID] = dataURL;
  setThumbsToLocalStorage(storedThumbs);
};

export const deleteThumbsLocalStorage = (docID: string) => {
  const storedThumbs = getThumbsFromLocalStorage();
  delete storedThumbs[docID];
  setThumbsToLocalStorage(storedThumbs);
};
