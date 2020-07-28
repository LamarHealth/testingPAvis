// NOTE: this is a javascript copy of the typescript KeyValuePairs.ts file in client. used for testing. jest and babel throwing a gnarly error when try to import typescript functions... so this is a workaround.

import { getEditDistancePercentage } from "./LevenshteinFieldCOPY";

// ///// INTERFACES /////
// // interface returned from getAllKeyValuePairs() .
// export interface KeyValues {
//   [key: string]: string; //e.g. "Date": "7/5/2015"
// }

// // interface returned from getKeyValuePairsByDoc()
// export interface KeyValuesByDoc {
//   docName: string;
//   docType: string;
//   docID: string;
//   keyValuePairs: KeyValues;
//   interpretedKeys: KeyValues;
// }

// // interface returned from getLevenDistanceAndSort()
// export interface KeyValuesWithDistance {
//   key: string;
//   value: string;
//   distanceFromTarget: number;
//   interpretedFrom?: string;
// }

///// FUNCTIONS /////
export const getKeyValuePairsByDoc = () => {
  const storedDocs = JSON.parse(localStorage.getItem("docList") || "[]");
  const docDataByDoc = [];
  storedDocs.forEach((doc) => {
    const docName = doc.docName;
    const docType = doc.docType;
    const docID = doc.docID;
    const keyValuePairs = doc.keyValuePairs;
    const interpretedKeys = doc.interpretedKeys;
    const docObj = {
      docName,
      docType,
      docID,
      keyValuePairs,
      interpretedKeys,
    };
    docDataByDoc.push(docObj);
  });
  return docDataByDoc;
};

export const getAllKeyValuePairs = () => {
  const storedDocs = JSON.parse(localStorage.getItem("docList") || "[]");
  let docData = {};
  storedDocs.forEach((doc) => {
    const keyValuePairs = doc.keyValuePairs;
    Object.keys(keyValuePairs).forEach((key) => {
      docData[key] = keyValuePairs[key];
    });
  });

  return { areThereDocs: !(storedDocs[0] === undefined), docData };
};

export const getLevenDistanceAndSort = (docData, targetString) => {
  const longestKeyLength = Object.keys(
    docData.keyValuePairs
  ).reduce((acc, cv) => (acc.length > cv.length ? acc : cv)).length;

  const docKeyValuePairs = Object.keys(docData.keyValuePairs).map((key) => {
    let entry = {};
    entry["key"] = key;
    entry["value"] = docData.keyValuePairs[key];
    entry["distanceFromTarget"] = getEditDistancePercentage(
      key,
      longestKeyLength,
      targetString
    );
    return entry;
  });

  const interpretedKeyValues = Object.keys(docData.interpretedKeys).map(
    (key) => {
      let entry = {};
      entry["key"] = docData.interpretedKeys[key];
      entry["value"] = lowercaseKeys(docData.keyValuePairs)[key];
      entry["distanceFromTarget"] = getEditDistancePercentage(
        docData.interpretedKeys[key],
        longestKeyLength,
        targetString
      );
      entry["interpretedFrom"] = key;
      return entry;
    }
  );

  const combinedKeyValuePairs = docKeyValuePairs.concat(interpretedKeyValues);

  combinedKeyValuePairs.sort((a, b) =>
    a.distanceFromTarget > b.distanceFromTarget ? -1 : 1
  );

  return combinedKeyValuePairs;
};

export const sortKeyValuePairs = (keyValuePairs, sortingMethod) => {
  switch (sortingMethod) {
    case "highest match":
      return keyValuePairs.sort((a, b) =>
        a.distanceFromTarget > b.distanceFromTarget ? -1 : 1
      );
    case "lowest match":
      return keyValuePairs.sort((a, b) =>
        a.distanceFromTarget > b.distanceFromTarget ? 1 : -1
      );
    case "a-to-z":
      return keyValuePairs.sort((a, b) => (a.key > b.key ? 1 : -1));
    case "z-to-a":
      return keyValuePairs.sort((a, b) => (a.key > b.key ? -1 : 1));
  }
  // if the sorting fails (it won't), but to satisfy typescript putting this here:
  console.log("sorting failed");
  return keyValuePairs;
};

export const deleteKVPairFromLocalStorage = (
  selectedDocID,
  faultyKey,
  faultyValue
) => {
  let storedDocs = JSON.parse(localStorage.getItem("docList") || "[]");

  let index = undefined;
  let selectedDoc = storedDocs.filter((doc, i) => {
    const itMatches = doc.docID === selectedDocID;
    if (itMatches) index = i;
    return itMatches;
  })[0];

  const newKVPairs = {};
  Object.keys(selectedDoc.keyValuePairs).forEach((key) => {
    if (key !== faultyKey && selectedDoc.keyValuePairs[key] !== faultyValue) {
      newKVPairs[key] = selectedDoc.keyValuePairs[key];
    }
  });

  selectedDoc.keyValuePairs = newKVPairs;

  storedDocs[index] = selectedDoc;

  localStorage.setItem("docList", JSON.stringify(storedDocs));
};

// helper functions
const lowercaseKeys = (initialObject) => {
  const lowercasedObject = {};
  Object.keys(initialObject).forEach((key) => {
    lowercasedObject[key.toLowerCase()] = initialObject[key];
  });
  return lowercasedObject;
};
