import { DocumentInfo } from "../../../types/documents";

export const getDocListFromLocalStorage = (): Promise<DocumentInfo[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get("docList", (result) => {
      const storedDocs = result.docList || [];
      resolve(storedDocs);
    });
  });
};

export const setDocListToLocalStorage = (
  docList: DocumentInfo[]
): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ docList: docList }, () => resolve());
  });
};

export const addDocToLocalStorage = (
  documentInfo: DocumentInfo
): Promise<DocumentInfo[]> => {
  return new Promise((resolve) => {
    getDocListFromLocalStorage()
      .then((storedDocs) => {
        storedDocs.push(documentInfo);
        setDocListToLocalStorage(storedDocs)
          .then(() => resolve(storedDocs))
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  });
};

export const deleteDocFromLocalStorage = (
  docID: string
): Promise<DocumentInfo[]> => {
  return new Promise((resolve) => {
    getDocListFromLocalStorage()
      .then((storedDocs) => {
        const newDocList = storedDocs.filter(
          (item: DocumentInfo) => item.docID !== docID
        );
        setDocListToLocalStorage(newDocList).then(() => {
          resolve(newDocList);
        });
      })
      .catch((err) => console.log(err));
  });
};
