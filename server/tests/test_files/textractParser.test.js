import { parseTextract } from "../../textractParser";
import masters3TextractJSON from "../textract_output/masters3.json";
import masters4TextractJSON from "../textract_output/masters4.json";
import masters5TextractJSON from "../textract_output/masters5.json";
import { masters3Fields } from "./masters3Fields";
import { masters4Fields } from "./masters4Fields";
import { masters5Fields } from "./masters5Fields";

const [
  masters3ParsedTextract,
  masters4ParsedTextract,
  masters5ParsedTextract,
] = [
  parseTextract(masters3TextractJSON),
  parseTextract(masters4TextractJSON),
  parseTextract(masters5TextractJSON),
];

const testForKeys = (testName, fieldsObj, parsedTextractData) => {
  return Object.keys(fieldsObj).map((key, i) => {
    return test(`${testName} key TEST ${i + 1}: ${key}`, () => {
      expect(parsedTextractData[key]).toBeDefined();
    });
  });
};

const testForValues = (testName, fieldsObj, parsedTextractData) => {
  return Object.keys(fieldsObj).map((key, i) => {
    // accounting for partial match. If they key exists in the data, then create a RE from it to match a partial; otherwise, continue with undefined
    let valueToMatch;
    if (parsedTextractData[key]) {
      // the textract data often repeats the key at the beginning of the value, so eliminating that here. Also + apparently not valid at beginning of RE so eliminating that as well.
      valueToMatch = new RegExp(
        parsedTextractData[key].replace(key.trim(), "").replace("+", "").trim()
      );
    } else {
      valueToMatch = undefined;
    }

    return test(`${testName} value TEST ${i + 1}: ${key}: ${
      fieldsObj[key]
    } `, () => {
      expect(fieldsObj[key]).toMatch(valueToMatch);
    });
  });
};

describe("Masters 3 Tests", () => {
  testForKeys("Mast3", masters3Fields, masters3ParsedTextract);
  testForValues("Mast3", masters3Fields, masters3ParsedTextract);
});

describe("Masters 4 Tests", () => {
  testForKeys("Mast4", masters4Fields, masters4ParsedTextract);
  testForValues("Mast4", masters4Fields, masters4ParsedTextract);
});

describe("Masters 5 Tests", () => {
  testForKeys("Mast5", masters5Fields, masters5ParsedTextract);
  testForValues("Mast5", masters5Fields, masters5ParsedTextract);
});
