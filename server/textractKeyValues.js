import keysDictionary from "./dictionaries/keysDictionary.json";

/**
 * Helper function used to parse textract tree
 */
export const getKvMap = (response) => {
  // get the text blocks
  const blocks = response["Blocks"];

  // get key and value maps
  const keyMap = {};
  const valueMap = {};
  const blockMap = {};

  blocks.forEach((block) => {
    let blockId = block["Id"];
    blockMap[blockId] = block;
    if (block["BlockType"] === "KEY_VALUE_SET") {
      block["EntityTypes"][0] === "KEY"
        ? (keyMap[blockId] = block)
        : (valueMap[blockId] = block);
    }
  });
  return [keyMap, valueMap, blockMap];
};

/**
 * Helper function used to link keys with values
 */
export const getKvRelationship = (keyMap, valueMap, blockMap) => {
  let kvs = {};
  Object.entries(keyMap).forEach((keyValueBlock) => {
    let [blockId, keyBlock] = keyValueBlock;
    let valueBlock = findValueBlock(keyBlock, valueMap);
    let key = getText(keyBlock, blockMap, "key");
    let val = getText(valueBlock, blockMap, "value");
    if (key !== "" || val !== "") {
      kvs[key] = val;
    }
  });
  return kvs;
};

/**
 * For each line in the document, return its text and geometry.
 * To display the bounding box with the correct location and size,
 * you have to multiply the BoundingBox values by the document
 * page width or height (depending on the value you want)
 * to get the pixel values. You use the pixel values to
 * display the bounding box.
 */
export const getLinesGeometry = (response) => {
  // get the text blocks
  const blocks = response["Blocks"];
  const lines = blocks.filter((block) => block["BlockType"] === "LINE");
  const kvs = lines.reduce((acc, lineBlock) => {
    let obj = {};
    obj["Coordinates"] = lineBlock["Geometry"]["Polygon"];
    obj["Text"] = lineBlock["Text"];
    // acc[lineBlock["Text"]] = lineBlock["Geometry"]["Polygon"];
    acc.push(obj);
    return acc;
  }, []);
  return kvs;
};

export const findValueBlock = (keyBlock, valueMap) => {
  let valueBlock;
  keyBlock["Relationships"].forEach((relationship) => {
    if (relationship["Type"] === "VALUE") {
      relationship["Ids"].forEach((valueId) => {
        valueBlock = valueMap[valueId];
      });
    }
  });
  return valueBlock;
};

export const getText = (result, blocksMap, type) => {
  let text = "";
  if (result && "Relationships" in result) {
    result["Relationships"].forEach((relationship) => {
      if (relationship["Type"] === "CHILD") {
        relationship["Ids"].forEach((childId) => {
          let word = blocksMap[childId];
          if (word["BlockType"] === "WORD") {
            text += word["Text"] + " ";
          }
          if (word["BlockType"] === "SELECTION_ELEMENT") {
            if (word["SelectionStatus"] === "SELECTED") {
              text += "X ";
            }
          }
        });
      }
    });
  }
  // if (type === "key" && ":" in key) {
  //   text = /(\w|\W)*(?=:$)/.exec(text.trim())[0];
  // }
  return text;
};

/**
 * Given a raw textract JSON response,
 * returns key-value pairs as an Object
 */
export const getKeyValues = (response) => {
  const [kvmap, valueMap, blockMap] = getKvMap(response);
  const kvRelationship = getKvRelationship(kvmap, valueMap, blockMap);
  return kvRelationship;
};

// helper functions
const expandTermsDictionary = (dictionary) => {
  // Expands the canonical terms list to include all similar variations of strings.
  let expandedTerms = {};
  Object.keys(dictionary).forEach((key) => {
    const interpretedValues = dictionary[key];
    if (Array.isArray(interpretedValues)) {
      interpretedValues.forEach((value) => {
        expandedTerms[value] = key;
      });
    }
  });
  return expandedTerms;
};

const sanitizeObject = (initialObject) => {
  const sanitizedObj = Object.entries(initialObject).reduce((accum, kvp) => {
    let key = kvp[0];
    let val = kvp[1];
    key = key.toLowerCase();
    val = val.toLowerCase();

    key = key
      .replace(/[0-9]/g, "") //replace '##.'
      .replace(/\:/g, "") //replace colons
      .replace(/(\(.*\))|(\(.*$)/g, "") //replace parens
      .trim(); //replace whitespace

    // assign to accum
    accum[key] = val;
  }, {});
  return sanitizedObj;
};

// get interpreted keys from kv pairs using the keysDictionary
export const getInterpretations = (uppercaseKVPairs) => {
  const kvPairs = sanitizeObject(uppercaseKVPairs);

  // reverse the dictionary, so that each value is a unique key
  let reversedKeysDictionary = sanitizeKeys(
    expandTermsDictionary(keysDictionary)
  );

  let interpretedKeys = {};
  Object.keys(reversedKeysDictionary).forEach((searchKey) => {
    Object.keys(kvPairs).forEach((key) => {
      if (key.includes(searchKey)) {
        interpretedKeys[key] = key.replace(
          searchKey,
          reversedKeysDictionary[searchKey]
        );
      }
    });
  });
  return interpretedKeys;
};
