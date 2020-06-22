import jest from "jest";
import { parseTextract } from "../../textractParser";
import masters3TextractJSON from "../textract_output/masters3.json";
import { masters3Fields } from "./masters3Fields";

const data = parseTextract(masters3TextractJSON);

console.log(data);

const testForKeys = Object.keys(masters3Fields).map((key, i) => {
  return test(`Mast3 key TEST ${i + 1}: ${key}`, () => {
    expect(data[key]).toBeDefined();
  });
});

const testForValue = Object.keys(masters3Fields).map((key, i) => {
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

  return test(`Mast3 value TEST ${i + 1}: ${key}: ${
    masters3Fields[key]
  } `, () => {
    expect(masters3Fields[key]).toMatch(valueToMatch);
  });
});
