import { getKvMap, getKvRelationship } from "../../textractKeyValues";
import masters3TextractJSON from "../textract_output/masters3.json";
import masters4TextractJSON from "../textract_output/masters4.json";
import masters5TextractJSON from "../textract_output/masters5.json";
import masters3kvmap from "./kv_response_output/masters3.json";
import masters3kvs from "./kv_relationships_output/masters3.json";

describe("Masters 3 Tests", () => {
  //   testForKeys("Mast3", masters3Fields, masters3ParsedTextract);
  //   testForValues("Mast3", masters3Fields, masters3ParsedTextract);
});

describe("Masters 3 Tests", () => {
  const [kvmap, valueMap, blockMap] = getKvMap(masters3TextractJSON);

  test("test kvMap", () => {
    expect([kvmap, valueMap, blockMap]).toEqual(masters3kvmap);
  });

  const kvRelationship = getKvRelationship(kvmap, valueMap, blockMap);
  console.log(kvRelationship);
  test("test getKvRelationship", () => {
    expect(kvRelationship).toEqual(masters3kvs);
  });
});

describe("Masters 5 Tests", () => {
  //   testForKeys("Mast5", masters5Fields, masters5ParsedTextract);
  //   testForValues("Mast5", masters5Fields, masters5ParsedTextract);
});
