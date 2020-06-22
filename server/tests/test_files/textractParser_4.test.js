import jest from "jest";
import { parseTextract } from "../../textractParser";
import masters4TextractJSON from "../textract_output/masters4.json";
import { masters4Fields } from "./masters4Fields";

const data = parseTextract(masters4TextractJSON);

console.log(data);

const testForKeys = Object.keys(masters4Fields).map((key, i) => {
  return test(`Mast4 key TEST ${i + 1}: ${key}`, () => {
    expect(data[key]).toBeDefined();
  });
});

const testForValue = Object.keys(masters4Fields).map((key, i) => {
  // accounting for partial match. If they key exists in the data, then create a RE from it to match a partial; otherwise, continue with undefined
  let valueToMatch;
  if (data[key]) {
    // the textract data often repeats the key at the beginning of the value, so eliminating that here. Also + apparently not valid at beginning of RE so eliminating that as well.
    valueToMatch = new RegExp(
      data[key].replace(key.trim(), "").replace("+", "").trim()
    );
  } else {
    valueToMatch = undefined;
  }

  return test(`Mast4 value TEST ${i + 1}: ${key}: ${
    masters4Fields[key]
  } `, () => {
    expect(masters4Fields[key]).toMatch(valueToMatch);
  });
});
