import masters3KeyValuePairs from "./kv_relationships_output_sanitized/masters3.json";
import masters4KeyValuePairs from "./kv_relationships_output_sanitized/masters4.json";
import masters5KeyValuePairs from "./kv_relationships_output_sanitized/masters5.json";
import shipDoc2KeyValuePairs from "./kv_relationships_output_sanitized/shippingDoc2.json";
import masters3MatchFields from "./field_matches/masters3.json";
import masters4MatchFields from "./field_matches/masters4.json";
import masters5MatchFields from "./field_matches/masters5.json";
import shipDoc2MatchFields from "./field_matches/shippingDoc2.json";
import { getInterpretations } from "./../../server/textractKeyValues";
import { getEditDistanceAndSort } from "./../src/components/KeyValuePairs";

const comparisonArr = [
  [masters3KeyValuePairs, masters3MatchFields],
  [masters4KeyValuePairs, masters4MatchFields],
  [masters5KeyValuePairs, masters5MatchFields],
  [shipDoc2KeyValuePairs, shipDoc2MatchFields],
].map((doc) => {
  const kvps = doc[0];
  const matchFields = doc[1];
  return {
    withInterpreted: {
      keyValuePairs: kvps,
      interpretedKeys: getInterpretations(kvps),
    },
    noInterpreted: {
      keyValuePairs: kvps,
      interpretedKeys: {},
    },
    matchFields,
  };
});

const testDoc = (doc, method, matchFields) => {
  Object.entries(matchFields).forEach((entry) => {
    const key = entry[0];
    const value = entry[1];
    const topMatch = getEditDistanceAndSort(doc, key, method)[0];
    test(`WANT: (${key}: ${value}) --> TOP KVP: (${topMatch.key}: ${topMatch.value})`, () => {
      value === ""
        ? expect(topMatch.value).toBe("")
        : expect(topMatch.value).toContain(value);
    });
  });
};

comparisonArr.forEach((doc, i) => {
  describe(`test ${i + 1} - leven - NO intepreted keys`, () => {
    testDoc(doc.noInterpreted, "leven", doc.matchFields);
  });
  describe(`test ${i + 1} - leven - WITH interpreted keys`, () => {
    testDoc(doc.withInterpreted, "leven", doc.matchFields);
  });
  describe(`test ${
    i + 1
  } - longest common substr - WITH interpreted keys`, () => {
    testDoc(doc.withInterpreted, "lc substring", doc.matchFields);
  });
});
