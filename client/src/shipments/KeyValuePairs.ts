import { getDistancePercentage } from "./LevenshteinField";

///// INTERFACES /////
// interface returned from getAllKeyValuePairs() .
export interface KeyValues {
  [key: string]: string; //e.g. "Date": "7/5/2015"
}

// interface returned from getKeyValuePairsByDoc()
export interface KeyValuesByDoc {
  docName: string;
  docType: string;
  docID: string;
  keyValuePairs: KeyValues;
  interpretedKeys: KeyValues;
}

// interface returned from getEditDistanceAndSort()
export interface KeyValuesWithDistance {
  key: string;
  value: string;
  distanceFromTarget: number;
  interpretedFrom?: string;
}

///// FUNCTIONS /////
export const getKeyValuePairsByDoc = (): KeyValuesByDoc[] => {
  const storedDocs = JSON.parse(localStorage.getItem("docList") || "[]");
  const docDataByDoc: any = [];
  storedDocs.forEach((doc: any) => {
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
  let docData: any = {};
  storedDocs.forEach((doc: any) => {
    const keyValuePairs = doc.keyValuePairs;
    Object.keys(keyValuePairs).forEach((key) => {
      docData[key] = keyValuePairs[key];
    });
  });

  return { areThereDocs: !(storedDocs[0] === undefined), docData };
};

export const getEditDistanceAndSort = (
  docData: KeyValuesByDoc,
  targetString: string,
  method: string
): KeyValuesWithDistance[] => {
  const longestKeyLength = Object.keys(
    docData.keyValuePairs
  ).reduce((acc, cv) => (acc.length > cv.length ? acc : cv)).length;

  const docKeyValuePairs = Object.keys(docData.keyValuePairs).map((key) => {
    let entry: any = {};
    entry["key"] = key;
    entry["value"] = docData.keyValuePairs[key];
    entry["distanceFromTarget"] = getDistancePercentage(
      key,
      longestKeyLength,
      targetString,
      method
    );
    return entry;
  });

  const interpretedKeyValues = Object.keys(docData.interpretedKeys).map(
    (key) => {
      let entry: any = {};
      entry["key"] = docData.interpretedKeys[key];
      entry["value"] = lowercaseKeys(docData.keyValuePairs)[key];
      entry["distanceFromTarget"] = getDistancePercentage(
        docData.interpretedKeys[key],
        longestKeyLength,
        targetString,
        method
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

export const sortKeyValuePairs = (
  keyValuePairs: KeyValuesWithDistance[],
  sortingMethod: string
): KeyValuesWithDistance[] => {
  switch (sortingMethod) {
    case "highest match":
      return keyValuePairs.sort(
        (a: KeyValuesWithDistance, b: KeyValuesWithDistance) =>
          a.distanceFromTarget > b.distanceFromTarget ? -1 : 1
      );
    case "lowest match":
      return keyValuePairs.sort(
        (a: KeyValuesWithDistance, b: KeyValuesWithDistance) =>
          a.distanceFromTarget > b.distanceFromTarget ? 1 : -1
      );
    case "a-to-z":
      return keyValuePairs.sort(
        (a: KeyValuesWithDistance, b: KeyValuesWithDistance) =>
          a.key > b.key ? 1 : -1
      );
    case "z-to-a":
      return keyValuePairs.sort(
        (a: KeyValuesWithDistance, b: KeyValuesWithDistance) =>
          a.key > b.key ? -1 : 1
      );
  }
  // if the sorting fails (it won't), but to satisfy typescript putting this here:
  console.log("sorting failed");
  return keyValuePairs;
};

export const deleteKVPairFromLocalStorage = (
  selectedDocID: any,
  faultyKey: string,
  faultyValue: string
) => {
  let storedDocs = JSON.parse(localStorage.getItem("docList") || "[]");

  let index = undefined as any;
  let selectedDoc = storedDocs.filter((doc: any, i: any) => {
    const itMatches = doc.docID === selectedDocID;
    if (itMatches) index = i;
    return itMatches;
  })[0];

  const newKVPairs = {} as any;
  Object.keys(selectedDoc.keyValuePairs).forEach((key: string) => {
    if (key !== faultyKey && selectedDoc.keyValuePairs[key] !== faultyValue) {
      newKVPairs[key] = selectedDoc.keyValuePairs[key];
    }
  });

  selectedDoc.keyValuePairs = newKVPairs;

  storedDocs[index] = selectedDoc;

  localStorage.setItem("docList", JSON.stringify(storedDocs));
};

// helper functions
const lowercaseKeys = (initialObject: any) => {
  const lowercasedObject = {} as any;
  Object.keys(initialObject).forEach((key) => {
    lowercasedObject[key.toLowerCase()] = initialObject[key];
  });
  return lowercasedObject;
};
