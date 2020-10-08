export interface DocThumbsReference {
  [docID: string]: string;
}

const getThumbsFromLocalStorage = (): DocThumbsReference =>
  JSON.parse(localStorage.getItem("docThumbnails") || "{}");

const setThumbsToLocalStorage = (thumbnails: DocThumbsReference) => {
  localStorage.setItem("docThumbnails", JSON.stringify(thumbnails));
};

export const updateThumbsLocalStorage = (
  docID: string,
  action: "add" | "delete",
  dataURL?: string
) => {
  const storedThumbs = getThumbsFromLocalStorage();
  switch (action) {
    case "add":
      if (dataURL) {
        storedThumbs[docID] = dataURL;
      } else throw new Error();
      break;
    case "delete":
      delete storedThumbs[docID];
      break;
  }
  setThumbsToLocalStorage(storedThumbs);
};
