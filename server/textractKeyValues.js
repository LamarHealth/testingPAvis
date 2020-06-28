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

export const getKvRelationship = (keyMap, valueMap, blockMap) => {
  let kvs = {};
  Object.entries(keyMap).forEach((keyValueBlock) => {
    let [blockId, keyBlock] = keyValueBlock;
    let valueBlock = findValueBlock(keyBlock, valueMap);
    let key = getText(keyBlock, blockMap);
    let val = getText(valueBlock, blockMap);
    kvs[key] = val;
  });
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

export const getText = (result, blocksMap) => {
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
  return text;
};

export const printKvs = (kvs) => {
  Object.entries(kvs).forEach((key, value) => {
    console.log(key, ":", value);
  });
};
