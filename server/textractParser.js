// const fs = require("fs");

export const parseTextract = (results) => {
  const keyValueBlocks = results.Blocks.filter(
    (block) => block.BlockType === "KEY_VALUE_SET"
  );

  const lines = results.Blocks.filter((block) => block.BlockType === "LINE");
  const words = results.Blocks.filter((block) => block.BlockType === "WORD");

  const keys = keyValueBlocks.filter((block) => block.EntityTypes[0] === "KEY");
  const values = keyValueBlocks.filter(
    (block) => block.EntityTypes[0] === "VALUE"
  );

  //   console.log(lines);

  const keyValueSets = keys.reduce((acc, current) => {
    let returnObj = {};
    console.log(current);

    let keyId = current.Id;
    let keyChildIds = current.Relationships.filter(
      (item) => item.Type === "CHILD"
    )[0];

    if (!!!keyChildIds) {
      return acc;
    }

    let keyLineText = keyChildIds.Ids.reduce(
      (accum, childId) =>
        accum + " " + words.filter((block) => block.Id === childId)[0].Text,
      ""
    );

    // let keyLine = lines.filter(block => block.Id === keyLineId);

    // console.log(keyId);
    // console.log(keyChildIds);
    // console.log(keyLineText);
    // // f1117101-29bf-4eec-9300-be3e4866fbd1
    // console.log("-------------------");
    // Correct so far!

    if (keyLineText.length === 0) {
      return acc;
    } else {
      let valueChildIds = current.Relationships.filter(
        (item) => item.Type === "VALUE"
      )[0].Ids;

      //   console.log(valueChildIds);
      //   if it's a VALUE that has an ID with relationshps,
      // then search for the line who has children containing that ID

      //   We got the key, now we have to search for the KVS that has that entity type
      let correspondingKVP = values.filter(
        (block) => block.Id === valueChildIds[0]
      )[0];

      //   Thsi shows the KVP that has the value we're looking for
      //   console.log(correspondingKVP);

      //   Next we want to find the line with that value (if it exists)

      // to check if it exists, see whether the corresponding KVP has any relationships, otherwise blank it
      if (!("Relationships" in correspondingKVP)) {
        returnObj[keyLineText] = "";
        return { ...acc, ...returnObj };
      }

      let KVPChildIds = correspondingKVP.Relationships[0].Ids;
      //   console.log(KVPChildIds);

      let containingLine = lines.filter((block) =>
        block.Relationships[0].Ids.includes(KVPChildIds[0])
      );
      //   console.log("&&&&&&");
      //   console.log(containingLine);
      let valueText = containingLine.length ? containingLine[0].Text : "";
      //   console.log(valueText);
      //   console.log("&&&&&&");

      //   console.log("*********");
      returnObj[keyLineText] = valueText;
      //   console.log(returnObj);

      return { ...acc, ...returnObj };
    }
  }, {});

  return keyValueSets;
};

// fs.readFile("./test.json", (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   let loaded = JSON.parse(data);
//   console.log(JSON.stringify(parseTextract(loaded)));
//   //   parseTextract(loaded);
// });
