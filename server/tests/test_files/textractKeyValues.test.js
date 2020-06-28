import {
  getKvMap,
  getKvRelationship,
  getLinesGeometry,
} from "../../textractKeyValues";
import masters3TextractJSON from "../textract_output/masters3.json";
import masters4TextractJSON from "../textract_output/masters4.json";
import masters5TextractJSON from "../textract_output/masters5.json";

import masters3kvmap from "./kv_response_output/masters3.json";
import masters4kvmap from "./kv_response_output/masters4.json";
import masters5kvmap from "./kv_response_output/masters5.json";

import masters3kvs from "./kv_relationships_output/masters3.json";
import masters4kvs from "./kv_relationships_output/masters4.json";
import masters5kvs from "./kv_relationships_output/masters5.json";

import masters3LineCoords from "./line_coordinates/masters3.js";
import masters4LineCoords from "./line_coordinates/masters4.js";
import masters5LineCoords from "./line_coordinates/masters5.js";

describe.each([
  [masters3TextractJSON, masters3kvmap, masters3kvs, masters3LineCoords],
  [masters4TextractJSON, masters4kvmap, masters4kvs, masters4LineCoords],
  [masters5TextractJSON, masters5kvmap, masters5kvs, masters5LineCoords],
])(
  "Test Key-Value Maps",
  (response, expectedKvMap, expectedKvs, expectedLineCoords) => {
    const [kvmap, valueMap, blockMap] = getKvMap(response);

    test("test kvMap", () => {
      expect([kvmap, valueMap, blockMap]).toEqual(expectedKvMap);
    });

    const kvRelationship = getKvRelationship(kvmap, valueMap, blockMap);
    test("test getKvRelationship", () => {
      expect(kvRelationship).toEqual(expectedKvs);
    });

    const linesGeometry = getLinesGeometry(response);
    test("Key Value Data", () => {
      expect(linesGeometry.sort()).toEqual(expectedLineCoords.sort());
    });
  }
);
