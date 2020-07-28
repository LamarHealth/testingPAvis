import { mastersKeys } from "./canonical_keys/mastersKeys";
import masters3KeyValuePairs from "./kv_relationships_output/masters3.json";
import masters4KeyValuePairs from "./kv_relationships_output/masters4.json";
import masters5KeyValuePairs from "./kv_relationships_output/masters5.json";
import { getInterpretations } from "./../../textractKeyValues";
import { getLevenDistanceAndSort } from "./javascript_copies/KeyValuePairsCOPY";

const comparisonArr = [
  masters3KeyValuePairs,
  masters4KeyValuePairs,
  masters5KeyValuePairs,
].map((kvps) => {
  return {
    withInterpreted: {
      keyValuePairs: kvps,
      interpretedKeys: getInterpretations(kvps),
    },
    noInterpreted: {
      keyValuePairs: kvps,
      interpretedKeys: {},
    },
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
