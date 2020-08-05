import mast3_25perScaled from "./page_scale/mast3_25perScaled.json";
import mast3_33perScaled from "./page_scale/mast3_33perScaled.json";
import mast3_50perScaled from "./page_scale/mast3_50perScaled.json";
import mast3_75perScaled from "./page_scale/mast3_75perScaled.json";
import mast3_100perNoScale from "./page_scale/mast3_100perNoScale.json";

// these are to test PAGE_SCALE. the file 100per_noScale is what we get when we load a pdf with no zoom on the browser; these are the correct kvps. The other files are the output when we zoom out the browser page, at Xper zoom, using the scaled PAGE_SCALE from the formula in constants.js. If our scaling formula is working correctly, then the kvps should be the same as the correct kvps with no zoom, regardless of how far out of the browser you are zoomed.

const scaledKvps = {
  mast3_25perScaled,
  mast3_33perScaled,
  mast3_50perScaled,
  mast3_75perScaled,
};

describe(`test PAGE_SCALE:`, () => {
  Object.entries(scaledKvps).forEach((entry) => {
    const kvpsName = entry[0];
    const kvps = entry[1];
    test(`expect ${kvpsName} to have same kvps as mast3_100perNoScale`, () => {
      expect(JSON.stringify(mast3_100perNoScale)).toBe(JSON.stringify(kvps));
    });
  });
});
