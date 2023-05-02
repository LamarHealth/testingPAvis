import { getDistancePercentage } from "./LevenshteinField";
import { KeyValuePairs, DocumentInfo, Line } from "../../../types/documents";
import {
  getDocListFromLocalStorage,
  setDocListToLocalStorage,
} from "./docList";

// interface returned from getKeyValuePairsByDoc()
export interface KeyValuesByDoc {
  docName: string;
  docType: string;
  docID: string;
  keyValuePairs: KeyValuePairs;
  interpretedKeys: KeyValuePairs;
  lines: Line[];
}

// interface returned from getEditDistanceAndSort()
export interface KeyValuesWithDistance {
  key: string;
  value: string;
  distanceFromTarget: number;
  secondaryDistanceFromTarget?: number;
  interpretedFrom?: string;
}

///// FUNCTIONS /////

export const getKeyValuePairsByDoc = (): Promise<KeyValuesByDoc[]> => {
  /**
   * Returns all documents from local storage as an array of objects.
   * Each object has the following properties:
   * - docName: string
   * - docType: string
   * - docID: string
   * - keyValuePairs: KeyValuePairs
   * - interpretedKeys: KeyValuePairs
   * - lines: string[]
   */
  return new Promise((resolve, reject) => {
    getDocListFromLocalStorage().then((storedDocs) => {
      const docDataByDoc: KeyValuesByDoc[] = [];
      storedDocs.forEach((doc: DocumentInfo) => {
        const docName = doc.docName;
        const docType = doc.docType;
        const docID = doc.docID;
        const keyValuePairs: KeyValuePairs = doc.keyValuePairs;
        const interpretedKeys = doc.keyValuePairs; // TODO: Replace interpretation logic with GPT
        const lines = doc.lines;
        const docObj = {
          docName,
          docType,
          docID,
          keyValuePairs,
          interpretedKeys,
          lines,
        };
        docDataByDoc.push(docObj);
      });
      resolve(docDataByDoc);
    });
  });
};

export const getEditDistanceAndSort = (
  docData: KeyValuesByDoc,
  targetString: string,
  method: "lc substring" | "leven"
): KeyValuesWithDistance[] => {
  const keyValuePairs = docData.keyValuePairs;
  const longestKeyLength = Object.keys(keyValuePairs).reduce((acc, cv) =>
    acc.length > cv.length ? acc : cv
  ).length;

  const docKeyValuePairs: KeyValuesWithDistance[] = Object.keys(
    keyValuePairs
  ).map((key) => {
    const distPercentage = getDistancePercentage(
      key,
      longestKeyLength,
      targetString,
      method
    );

    const entry = {
      key: key,
      value: keyValuePairs[key],
      distanceFromTarget: distPercentage > 0 ? distPercentage : 0,
    };

    return entry;
  });

  const interpretedKeys = docData.interpretedKeys;
  const interpretedKeyValues = Object.keys(interpretedKeys).map((key) => {
    const entry = {
      key: interpretedKeys[key],
      value: lowercaseKeys(keyValuePairs)[key.toLowerCase()],
      distanceFromTarget: getDistancePercentage(
        interpretedKeys[key],
        longestKeyLength,
        targetString,
        method
      ),
      interpretedFrom: key,
    };
    return entry;
  });

  const combinedKeyValuePairs = docKeyValuePairs.concat(interpretedKeyValues);

  combinedKeyValuePairs.sort((a, b) => {
    if (
      // if same distance, then use leven to break the tie
      a.distanceFromTarget === b.distanceFromTarget &&
      method === "lc substring"
    ) {
      a.secondaryDistanceFromTarget = getDistancePercentage(
        a.key,
        longestKeyLength,
        targetString,
        "leven"
      );
      b.secondaryDistanceFromTarget = getDistancePercentage(
        b.key,
        longestKeyLength,
        targetString,
        "leven"
      );
      return a.secondaryDistanceFromTarget > b.secondaryDistanceFromTarget
        ? -1
        : 1;
    } else return a.distanceFromTarget > b.distanceFromTarget ? -1 : 1;
  });

  return combinedKeyValuePairs;
};

export const sortKeyValuePairs = (
  keyValuePairs: KeyValuesWithDistance[],
  sortingMethod: "highest match" | "lowest match" | "a-to-z" | "z-to-a"
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
};

export const deleteKVPairFromLocalStorage = (
  selectedDocID: string,
  faultyKey: string,
  faultyValue: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    getDocListFromLocalStorage().then((storedDocs) => {
      let index = undefined as any;
      let selectedDoc = storedDocs.filter((doc: any, i: any) => {
        const itMatches = doc.docID === selectedDocID;
        if (itMatches) index = i;
        return itMatches;
      })[0];

      const newKVPairs = {} as any;
      Object.keys(selectedDoc.keyValuePairs).forEach((key: string) => {
        if (
          key !== faultyKey &&
          selectedDoc.keyValuePairs[key] !== faultyValue
        ) {
          newKVPairs[key] = selectedDoc.keyValuePairs[key];
        }
      });

      selectedDoc.keyValuePairs = newKVPairs;

      storedDocs[index] = selectedDoc;

      setDocListToLocalStorage(storedDocs).then(() => resolve());
    });
  });
};

export const hasGoodHighestMatch = (
  sortedKeyValuePairs: KeyValuesWithDistance[]
) =>
  sortedKeyValuePairs[0].distanceFromTarget > 0.5 &&
  sortedKeyValuePairs[0].value !== "";

// helper functions
const lowercaseKeys = (initialObject: KeyValuePairs): KeyValuePairs => {
  return Object.entries(initialObject).reduce(
    (lowercasedObject, [key, value]) => {
      lowercasedObject[key.toLowerCase()] = value;
      return lowercasedObject;
    },
    {} as KeyValuePairs
  );
};
