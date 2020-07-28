import { mastersKeys } from "./canonical_keys/mastersKeys";
import masters3KeyValuePairs from "./kv_relationships_output/masters3.json";
import masters4KeyValuePairs from "./kv_relationships_output/masters4.json";
import masters5KeyValuePairs from "./kv_relationships_output/masters5.json";
import { getInterpretations } from "./../../textractKeyValues";
import { getLevenDistanceAndSort } from "./javascript_copies/KeyValuePairsCOPY";

const docKvps = [
  masters3KeyValuePairs,
  masters4KeyValuePairs,
  masters5KeyValuePairs,
];

// needs to fit shape of interface KeyValuesByDoc if we are using the typescript... if we are using the js workaround, then not necessary
const docifyDoc = (kvps, addInterpreted) => {
  return {
    docName: "some-doc-name",
    docType: "pdf",
    docID: "s0m3-Uu1D-r4nd0m-nuMb3r-s3qu3nce",
    keyValuePairs: kvps,
    interpretedKeys: addInterpreted ? getInterpretations(kvps) : {},
  };
};

const comparisonArr = docKvps.map((kvps) => {
  return {
    withInterpreted: docifyDoc(kvps, true),
    noInterpreted: docifyDoc(kvps, false),
  };
});

const testDoc = (doc) => {
  mastersKeys.forEach((uppercaseKey) => {
    const key = uppercaseKey.toLowerCase();
    const keyRE = new RegExp(key);
    const topKeyMatch = getLevenDistanceAndSort(doc, key)[0].key.toLowerCase();
    test(`expect top match (${topKeyMatch}) to contain key (${key})`, () => {
      expect(topKeyMatch).toMatch(keyRE);
    });
  });
};

comparisonArr.forEach((compPair, i) => {
  describe(`test ${i} WITH intepreted keys`, () => {
    testDoc(compPair.withInterpreted);
  });
  describe(`test ${i} NO intepreted keys`, () => {
    testDoc(compPair.noInterpreted);
  });
});
