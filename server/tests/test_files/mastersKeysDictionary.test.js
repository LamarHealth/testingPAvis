import { mastersKeys } from "./canonical_keys/mastersKeys";
import masters3KeyValuePairs from "./kv_relationships_output/masters3.json";
import masters4KeyValuePairs from "./kv_relationships_output/masters4.json";
import masters5KeyValuePairs from "./kv_relationships_output/masters5.json";
import shipDoc2KeyValuePairs from "./kv_relationships_output/shippingDoc2.json";
import { getInterpretations } from "./../../textractKeyValues";
import { getEditDistanceAndSort } from "./javascript_copies/KeyValuePairsCOPY";

const comparisonArr = [
  masters3KeyValuePairs,
  masters4KeyValuePairs,
  masters5KeyValuePairs,
  shipDoc2KeyValuePairs,
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

const testDoc = (doc, method) => {
  mastersKeys.forEach((uppercaseKey) => {
    const key = uppercaseKey.toLowerCase();
    const keyRE = new RegExp(key);
    const topKeyMatch = getEditDistanceAndSort(
      doc,
      key,
      method
    )[0].key.toLowerCase();
    test(`expect top match (${topKeyMatch}) to contain key (${key})`, () => {
      expect(topKeyMatch).toMatch(keyRE);
    });
  });
};

comparisonArr.forEach((compPair, i) => {
  describe(`test ${i + 1} - leven - NO intepreted keys`, () => {
    testDoc(compPair.noInterpreted, "leven");
  });
  describe(`test ${i + 1} - leven - WITH interpreted keys`, () => {
    testDoc(compPair.withInterpreted, "leven");
  });
  describe(`test ${
    i + 1
  } - longest common substr - WITH interpreted keys`, () => {
    testDoc(compPair.withInterpreted, "lc substring");
  });
});
