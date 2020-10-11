export interface DocThumbsReference {
  [docID: string]: string;
}

export const getThumbsFromLocalStorage = (): DocThumbsReference =>
  JSON.parse(localStorage.getItem("docThumbnails") || "{}");

const setThumbsToLocalStorage = (thumbnails: DocThumbsReference) => {
  localStorage.setItem("docThumbnails", JSON.stringify(thumbnails));
};

export enum updateThumbsActionTypes {
  add = "add",
  delete = "delete",
}

export const updateThumbsLocalStorage = (
  docID: string,
  action: updateThumbsActionTypes,
  dataURL?: string
) => {
  const storedThumbs = getThumbsFromLocalStorage();
  switch (action) {
    case updateThumbsActionTypes.add:
      if (dataURL) {
        storedThumbs[docID] = dataURL;
      } else throw new Error();
      break;
    case updateThumbsActionTypes.delete:
      delete storedThumbs[docID];
      break;
  }
  setThumbsToLocalStorage(storedThumbs);
};
