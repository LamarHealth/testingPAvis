export interface DocThumbsReference {
  [docID: string]: string;
}

export const updateThumbsLocalStorage = (docID: string, dataURL: string) => {
  // thumbnails
  // console.log("dataURL, ", dataURL);
  // console.log("docID, ", docID);

  const storedThumbs = JSON.parse(
    localStorage.getItem("docThumbnails") || "{}"
  ) as DocThumbsReference;
  // console.log("storedThumbs, ", storedThumbs);
  storedThumbs[docID] = dataURL;
  localStorage.setItem("docThumbnails", JSON.stringify(storedThumbs));

  // return new Promise((resolve) => resolve());
};
