import { getEditDistance } from "./LevenshteinField";

// getting data from local storage
export const getKeyValuePairs = () => {
  const storedDocs = JSON.parse(localStorage.getItem("docList") || "[]");
  let docData: any = {};
  storedDocs.forEach((doc: any) => {
    const keyValuePairs = doc.keyValuePairs;
    Object.keys(keyValuePairs).forEach((key) => {
      docData[key] = keyValuePairs[key];
    });
  });

  return { areThereDocs: !(storedDocs[0] === undefined), docData };
};

// interface passed between getKeyValuePairs() and getLevenDistanceAndSort()
export interface KeyValues {
  [key: string]: string; //e.g. "Date": "7/5/2015"
}

export const getLevenDistanceAndSort = (
  docData: KeyValues,
  targetString: string
) => {
  const longestKeyLength = Object.keys(docData).reduce((acc, cv) =>
    acc.length > cv.length ? acc : cv
  ).length;

  const docKeyValuePairs = Object.keys(docData).map((key) => {
    let entry: any = {};
    entry["key"] = key;
    entry["value"] = docData[key];
    entry["distanceFromTarget"] =
      (longestKeyLength - getEditDistance(targetString, key)) /
      longestKeyLength;
    return entry;
  });

  docKeyValuePairs.sort((a, b) =>
    a.distanceFromTarget > b.distanceFromTarget ? -1 : 1
  );

  return docKeyValuePairs;
};

export const sortKeyValuePairs = (
  keyValuePairs: any,
  sortingMethod: string
) => {
  switch (sortingMethod) {
    case "highest match":
      return keyValuePairs.sort((a: any, b: any) =>
        a.distanceFromTarget > b.distanceFromTarget ? -1 : 1
      );
    case "lowest match":
      return keyValuePairs.sort((a: any, b: any) =>
        a.distanceFromTarget > b.distanceFromTarget ? 1 : -1
      );
    case "a-to-z":
      return keyValuePairs.sort((a: any, b: any) => (a.key > b.key ? 1 : -1));
    case "z-to-a":
      return keyValuePairs.sort((a: any, b: any) => (a.key > b.key ? -1 : 1));
  }
};
